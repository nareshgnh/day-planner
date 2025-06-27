// src/components/PhotoCheckIn.jsx
import React, { useState, useRef } from "react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Dialog } from "../ui/Dialog";
import { Camera, Upload, X, Check, Image } from "lucide-react";

export const PhotoCheckIn = ({
  isOpen,
  onClose,
  onPhotoSubmit,
  habit,
  selectedDate,
}) => {
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [caption, setCaption] = useState("");
  const [stream, setStream] = useState(null);
  const [location, setLocation] = useState("");
  const [energy, setEnergy] = useState(5); // 1-10 scale
  const [mood, setMood] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert(
        "Could not access camera. Please check permissions or try uploading a photo instead."
      );
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          const url = URL.createObjectURL(blob);
          setCapturedPhoto({ blob, url });
          stopCamera();
        },
        "image/jpeg",
        0.8
      );
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setCapturedPhoto({ blob: file, url });
    }
  };

  // Helper to auto-detect location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      },
      (err) => {
        alert("Could not get location: " + err.message);
      }
    );
  };

  const submitPhoto = () => {
    if (capturedPhoto && onPhotoSubmit) {
      setIsSaving(true);
      const photoData = {
        photo: capturedPhoto.blob,
        caption: caption.trim(),
        habit: habit,
        date: selectedDate,
        timestamp: new Date().toISOString(),
        location,
        energy,
        mood,
      };
      onPhotoSubmit(photoData);
      setIsSaving(false);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedPhoto(null);
    setCaption("");
    setLocation("");
    setEnergy(5);
    setMood("");
    onClose();
  };

  const retakePhoto = () => {
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto.url);
      setCapturedPhoto(null);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera size={20} className="text-blue-600" />
              Photo Check-in
              {habit && (
                <span className="text-sm font-normal text-gray-600">
                  - {habit.title}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!capturedPhoto && !isCapturing && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Capture a photo to document your habit completion or progress.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={startCamera}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Camera size={16} />
                    Take Photo
                  </Button>

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Upload Photo
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {isCapturing && (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={capturePhoto}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Camera size={16} className="mr-2" />
                    Capture
                  </Button>
                  <Button onClick={stopCamera} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {capturedPhoto && (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={capturedPhoto.url}
                    alt="Captured habit photo"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Add a caption (optional)
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="How did it go? Any notes about your progress..."
                    className="w-full p-3 border rounded-lg resize-none h-20 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {caption.length}/200 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Location
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Auto or enter manually"
                        className="w-full p-1 border rounded text-xs"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={detectLocation}
                        title="Detect Location"
                      >
                        <Image size={14} />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Energy
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={energy}
                      onChange={(e) => setEnergy(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-center">{energy}/10</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Mood
                    </label>
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="w-full p-1 border rounded text-xs"
                    >
                      <option value="">Select</option>
                      <option value="😀">😀 Happy</option>
                      <option value="😐">😐 Neutral</option>
                      <option value="😔">😔 Tired</option>
                      <option value="😡">😡 Frustrated</option>
                      <option value="😇">😇 Calm</option>
                      <option value="💪">💪 Motivated</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={submitPhoto}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={isSaving}
                  >
                    <Check size={16} className="mr-2" />
                    Save Check-in
                  </Button>
                  <Button
                    onClick={retakePhoto}
                    variant="outline"
                    disabled={isSaving}
                  >
                    Retake
                  </Button>
                </div>
              </div>
            )}

            {/* Photo Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                Photo Tips:
              </p>
              <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <p>• Good lighting helps capture clear photos</p>
                <p>• Show your progress or completed activity</p>
                <p>• Add notes about how you feel or what you learned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Dialog>
  );
};

// Hook for managing photo check-ins
export const usePhotoCheckIn = () => {
  const [photos, setPhotos] = useState([]);

  const addPhoto = (photoData) => {
    const photoWithId = {
      ...photoData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    setPhotos((prev) => [photoWithId, ...prev]);

    // In a real app, you would upload to cloud storage here
    console.log("Photo added:", photoWithId);

    return photoWithId;
  };

  const getPhotosForHabit = (habitId, date) => {
    const dateStr =
      typeof date === "string" ? date : date.toISOString().split("T")[0];
    return photos.filter(
      (photo) =>
        photo.habit?.id === habitId &&
        photo.date?.toISOString?.()?.split("T")[0] === dateStr
    );
  };

  const getAllPhotos = () => photos;

  return {
    photos,
    addPhoto,
    getPhotosForHabit,
    getAllPhotos,
  };
};
