import { MdVerified } from "react-icons/md";

interface UserBadgeProps {
  isAdmin?: boolean;
  isVerified?: boolean;
  size?: "sm" | "md" | "lg";
}

export function UserBadge({ isAdmin, isVerified, size = "md" }: UserBadgeProps) {
  // Tidak menampilkan apa-apa jika pengguna bukan admin atau tidak terverifikasi
  if (!isAdmin && !isVerified) return null;
  
  // Menentukan ukuran badge sesuai props
  const sizeClass = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };
  
  // Admin badge memiliki prioritas lebih tinggi dari verification badge
  if (isAdmin) {
    return (
      <MdVerified 
        className={`${sizeClass[size]} text-amber-500 ml-1`} 
        title="Admin" 
      />
    );
  }
  
  return (
    <MdVerified 
      className={`${sizeClass[size]} text-blue-500 ml-1`} 
      title="Verified User" 
    />
  );
}