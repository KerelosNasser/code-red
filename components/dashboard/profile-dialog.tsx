import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateProfile: (e: React.FormEvent) => void
  firstName: string
  setFirstName: (v: string) => void
  lastName: string
  setLastName: (v: string) => void
  phone: string
  isUpdating: boolean
}

export function ProfileDialog({
  open,
  onOpenChange,
  onUpdateProfile,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  isUpdating,
}: ProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Admin Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={onUpdateProfile} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Admin"
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone (Reference)</Label>
            <Input
              value={phone}
              disabled
              className="bg-slate-50"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-red-700 hover:bg-red-600"
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
