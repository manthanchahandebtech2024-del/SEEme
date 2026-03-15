import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, FileText, X } from "lucide-react";

interface Props {
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  label?: string;
}

export default function FileUpload({
  files,
  onFilesChange,
  multiple = false,
  label = "Drop your resume here",
}: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (multiple) {
        onFilesChange([...files, ...accepted]);
      } else {
        onFilesChange(accepted.slice(0, 1));
      }
    },
    [files, multiple, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    multiple,
  });

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <motion.div
        {...(getRootProps() as React.ComponentProps<typeof motion.div>)}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-seeme-accent bg-seeme-accent/5"
            : "border-seeme-border hover:border-seeme-accent/50 hover:bg-seeme-card/30"
        }`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input {...getInputProps()} />
        <Upload
          size={36}
          className={`mx-auto mb-3 ${isDragActive ? "text-seeme-accent" : "text-seeme-muted"}`}
        />
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-seeme-muted mt-1">PDF, DOCX, or TXT (max 10MB)</p>
      </motion.div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <motion.div
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 p-3 bg-seeme-card rounded-lg border border-seeme-border/50"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <FileText size={16} className="text-seeme-accent flex-shrink-0" />
              <span className="text-sm truncate flex-1">{file.name}</span>
              <span className="text-xs text-seeme-muted">{(file.size / 1024).toFixed(1)}KB</span>
              <button
                onClick={() => removeFile(i)}
                className="text-seeme-muted hover:text-seeme-danger transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
