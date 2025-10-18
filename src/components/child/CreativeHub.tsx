import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Palette, Eraser, Download, Trash2, Sparkles } from "lucide-react";

interface CreativeHubProps {
  childId: string;
}

const colors = [
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Green", value: "#22C55E" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Purple", value: "#A855F7" },
  { name: "Pink", value: "#EC4899" },
  { name: "Black", value: "#1F2937" },
];

const CreativeHub = ({ childId }: CreativeHubProps) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(colors[0].value);
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.strokeStyle = isEraser ? "#FFFFFF" : currentColor;
      ctx.lineWidth = isEraser ? brushSize * 2 : brushSize;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveArtwork = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL();

      await supabase.from("creative_works").insert({
        child_id: childId,
        work_type: "drawing",
        work_data: { image_data: dataUrl },
      });

      await supabase.from("progress_entries").insert({
        child_id: childId,
        activity_type: "creative_work",
      });

      toast({
        title: "Artwork saved! 🎨",
        description: "Your beautiful creation is saved in your gallery!",
      });
    } catch (error) {
      console.error("Error saving artwork:", error);
      toast({
        title: "Oops!",
        description: "Couldn't save your artwork. Try again!",
        variant: "destructive",
      });
    }
  };

  const downloadArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `griffit-artwork-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Downloaded! 📥",
      description: "Your artwork is saved to your device!",
    });
  };

  return (
    <Card className="p-6 glass-effect shadow-[var(--shadow-float)] border-2 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-accent mb-2 flex items-center gap-2">
          <Palette className="w-8 h-8" />
          Creative Expression Hub
        </h2>
        <p className="text-muted-foreground text-lg">
          Draw your feelings, paint your world! 🎨
        </p>
      </div>

      {/* Drawing Canvas */}
      <div className="mb-6 bg-white rounded-2xl p-4 shadow-inner">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border-2 border-dashed border-gray-300 rounded-xl cursor-crosshair w-full"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      {/* Color Palette */}
      <div className="mb-6">
        <p className="text-lg font-semibold mb-3">Choose your color:</p>
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => {
                setCurrentColor(color.value);
                setIsEraser(false);
              }}
              className={`w-12 h-12 rounded-full transition-all duration-300 ${
                currentColor === color.value && !isEraser
                  ? "scale-125 ring-4 ring-primary"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Brush Size */}
      <div className="mb-6">
        <p className="text-lg font-semibold mb-3">Brush size: {brushSize}px</p>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Tools */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          onClick={() => setIsEraser(!isEraser)}
          variant={isEraser ? "default" : "outline"}
          className="rounded-xl h-12"
        >
          <Eraser className="w-5 h-5 mr-2" />
          Eraser
        </Button>

        <Button onClick={clearCanvas} variant="outline" className="rounded-xl h-12">
          <Trash2 className="w-5 h-5 mr-2" />
          Clear
        </Button>

        <Button onClick={saveArtwork} className="rounded-xl h-12 bg-primary">
          <Sparkles className="w-5 h-5 mr-2" />
          Save
        </Button>

        <Button onClick={downloadArtwork} variant="outline" className="rounded-xl h-12">
          <Download className="w-5 h-5 mr-2" />
          Download
        </Button>
      </div>
    </Card>
  );
};

export default CreativeHub;
