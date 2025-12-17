"use client"

import { X, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserMenuProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
  userEmail: string
}

export function UserMenu({ isOpen, onClose, onLogout, userEmail }: UserMenuProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Side Panel */}
      <div className="fixed top-0 right-0 h-full w-[320px] max-w-[90vw] bg-card border-l border-border shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#0dadb7]" />
            <h2 className="text-lg font-semibold">Account</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="flex-1 p-4">
          <div className="bg-[#F6F6F6] rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#0dadb7]/20 flex items-center justify-center">
                <User className="h-5 w-5 text-[#0dadb7]" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Signed in as</p>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground bg-transparent"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  )
}
