import { User } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  PlusCircledIcon,
  PersonIcon,
  HomeIcon,
  GlobeIcon,
  IdCardIcon,
  InfoCircledIcon,
  EnvelopeClosedIcon
} from "@radix-ui/react-icons";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ProfileCompletionProps {
  user: User;
  onEditProfile: () => void;
}

interface ProfileField {
  name: string;
  key: keyof User;
  icon: React.ReactNode;
  description: string;
}

export function ProfileCompletion({ user, onEditProfile }: ProfileCompletionProps) {
  const [progress, setProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const profileFields: ProfileField[] = [
    {
      name: "Nama Pengguna",
      key: "username",
      icon: <PersonIcon className="h-4 w-4" />,
      description: "Nama pengguna yang digunakan untuk login"
    },
    {
      name: "Email",
      key: "email",
      icon: <EnvelopeClosedIcon className="h-4 w-4" />,
      description: "Email utama untuk komunikasi"
    },
    {
      name: "Bio",
      key: "bio",
      icon: <InfoCircledIcon className="h-4 w-4" />,
      description: "Ceritakan sedikit tentang diri Anda"
    },
    {
      name: "Perusahaan",
      key: "company",
      icon: <IdCardIcon className="h-4 w-4" />,
      description: "Perusahaan atau organisasi tempat Anda bekerja"
    },
    {
      name: "Lokasi",
      key: "location",
      icon: <HomeIcon className="h-4 w-4" />,
      description: "Kota atau negara tempat Anda tinggal"
    },
    {
      name: "Website",
      key: "website",
      icon: <GlobeIcon className="h-4 w-4" />,
      description: "Website personal atau profesional Anda"
    }
  ];

  // Menghitung persentase kelengkapan profil
  const calculateProgress = () => {
    const completedFields = profileFields.filter(field => {
      const value = user[field.key];
      return value !== undefined && value !== null && value !== "";
    });
    
    const percentage = (completedFields.length / profileFields.length) * 100;
    return Math.round(percentage);
  };

  useEffect(() => {
    const calculatedProgress = calculateProgress();
    setProgress(calculatedProgress);
  }, [user]);

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-md">Kelengkapan Profil</CardTitle>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <CardDescription>
            Lengkapi profil Anda untuk meningkatkan kredibilitas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between items-center">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="link" 
                  className="text-xs p-0 h-auto"
                >
                  Lihat Detail
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Detail Kelengkapan Profil</DialogTitle>
                  <DialogDescription>
                    {progress < 100 
                      ? "Lengkapi profil Anda untuk meningkatkan kredibilitas" 
                      : "Profil Anda sudah lengkap! Terima kasih."}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4 space-y-4">
                  {profileFields.map((field) => {
                    const isComplete = user[field.key] !== undefined && 
                                      user[field.key] !== null && 
                                      user[field.key] !== "";
                    
                    return (
                      <div 
                        key={field.key.toString()}
                        className="flex items-start justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 ${isComplete ? 'text-green-500' : 'text-gray-400'}`}>
                            {field.icon}
                          </div>
                          <div>
                            <div className="font-medium">{field.name}</div>
                            <div className="text-sm text-gray-500">{field.description}</div>
                          </div>
                        </div>
                        <div>
                          {isComplete ? (
                            <CheckCircledIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <CrossCircledIcon className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => {
                      setIsOpen(false);
                      onEditProfile();
                    }}
                  >
                    Edit Profil
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={onEditProfile}
              className="text-xs"
            >
              <PlusCircledIcon className="h-3.5 w-3.5 mr-1" />
              Lengkapi Profil
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}