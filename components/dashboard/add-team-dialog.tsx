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

interface AddTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTeam: (e: React.FormEvent) => void
  newTeamName: string
  setNewTeamName: (name: string) => void
  isAddingTeam: boolean
}

export function AddTeamDialog({
  open,
  onOpenChange,
  onAddTeam,
  newTeamName,
  setNewTeamName,
  isAddingTeam,
}: AddTeamDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>
        <form onSubmit={onAddTeam} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="e.g. RoboKnights"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-800"
            disabled={isAddingTeam || !newTeamName.trim()}
          >
            {isAddingTeam ? "Creating..." : "Create Team"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
