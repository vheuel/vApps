import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2,
  ShieldCheck,
  ShieldX,
  Search,
  UserCheck,
  AlertTriangle
} from "lucide-react";
import { 
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function UsersManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"verify" | "unverify">("verify");

  const { data: users, isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });
  
  const verifyUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/users/${id}/verify`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User verified",
        description: "The user has been granted verified status.",
      });
      setConfirmationOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to verify user",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const unverifyUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/users/${id}/unverify`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User unverified",
        description: "The user's verified status has been removed.",
      });
      setConfirmationOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to unverify user",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleVerifyClick = (user: User) => {
    setSelectedUser(user);
    setActionType("verify");
    setConfirmationOpen(true);
  };

  const handleUnverifyClick = (user: User) => {
    setSelectedUser(user);
    setActionType("unverify");
    setConfirmationOpen(true);
  };

  const confirmAction = () => {
    if (!selectedUser) return;
    
    if (actionType === "verify") {
      verifyUserMutation.mutate(selectedUser.id);
    } else {
      unverifyUserMutation.mutate(selectedUser.id);
    }
  };

  // Filter users based on search query
  const filteredUsers = users?.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  // Get user stats
  const totalUsers = users?.length || 0;
  const verifiedUsers = users?.filter(u => u.verified).length || 0;
  const adminUsers = users?.filter(u => u.isAdmin).length || 0;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center text-center py-6">
            <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-2">
              <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center text-center py-6">
            <div className="p-2 rounded-full bg-green-50 dark:bg-green-900/20 mb-2">
              <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold">{verifiedUsers}</div>
            <p className="text-muted-foreground">Verified Users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center text-center py-6">
            <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-900/20 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-bold">{adminUsers}</div>
            <p className="text-muted-foreground">Admin Users</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user verification status and roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isUsersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !filteredUsers || filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            {user.avatarUrl ? (
                              <AvatarImage src={user.avatarUrl} alt={user.username} />
                            ) : null}
                            <AvatarFallback>
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>{user.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {user.isAdmin && (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                              Admin
                            </Badge>
                          )}
                          {user.verified && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                              Verified
                            </Badge>
                          )}
                          {!user.verified && !user.isAdmin && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-200 dark:border-gray-800">
                              Regular
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {!user.isAdmin && (
                          <div className="flex justify-end space-x-2">
                            {user.verified ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      onClick={() => handleUnverifyClick(user)}
                                      disabled={unverifyUserMutation.isPending}
                                    >
                                      <ShieldX className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Remove Verification</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      onClick={() => handleVerifyClick(user)}
                                      disabled={verifyUserMutation.isPending}
                                    >
                                      <ShieldCheck className="h-4 w-4 text-blue-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Verify User</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "verify" ? "Verify User" : "Remove Verification"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "verify"
                ? "Are you sure you want to verify this user? Verified users have a special badge displayed on their profile and posts."
                : "Are you sure you want to remove verification from this user? This will remove their verified badge from their profile and posts."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="flex items-center space-x-3 p-4 bg-muted rounded-md">
              <Avatar className="h-10 w-10">
                {selectedUser.avatarUrl ? (
                  <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.username} />
                ) : null}
                <AvatarFallback>
                  {selectedUser.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{selectedUser.username}</div>
                <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmationOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === "verify" ? "default" : "destructive"}
              onClick={confirmAction} 
              disabled={verifyUserMutation.isPending || unverifyUserMutation.isPending}
            >
              {(verifyUserMutation.isPending || unverifyUserMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {actionType === "verify" ? "Verify User" : "Remove Verification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}