"use client"

import { useState } from "react"
import { X, LogOut, User, Eye, EyeOff, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

interface UserMenuProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
  userEmail: string
  userName: string
  onUserNameChange: (name: string) => void
}

export function UserMenu({ isOpen, onClose, onLogout, userEmail, userName, onUserNameChange }: UserMenuProps) {
  // Profile state
  const [displayName, setDisplayName] = useState(userName)
  const [newEmail, setNewEmail] = useState(userEmail)
  const [isSavingName, setIsSavingName] = useState(false)
  const [isSavingEmail, setIsSavingEmail] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const [error, setError] = useState("")

  const handleClose = () => {
    setDisplayName(userName)
    setNewEmail(userEmail)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setNameSuccess(false)
    setEmailSuccess(false)
    setPasswordSuccess(false)
    onClose()
  }

  const handleSaveName = async () => {
    if (!displayName.trim()) return
    setIsSavingName(true)
    setError("")
    setNameSuccess(false)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim() }
      })
      if (updateError) throw updateError
      onUserNameChange(displayName.trim())
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update display name")
    } finally {
      setIsSavingName(false)
    }
  }

  const handleSaveEmail = async () => {
    if (!newEmail.trim() || newEmail === userEmail) return
    setIsSavingEmail(true)
    setError("")
    setEmailSuccess(false)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail.trim()
      })
      if (updateError) throw updateError
      setEmailSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update email")
    } finally {
      setIsSavingEmail(false)
    }
  }

  const handleChangePassword = async () => {
    setError("")
    setPasswordSuccess(false)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All password fields are required")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters")
      return
    }

    setIsSavingPassword(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      })
      if (signInError) {
        setError("Current password is incorrect")
        setIsSavingPassword(false)
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (updateError) throw updateError

      setPasswordSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update password")
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (!isOpen) return null

  const nameChanged = displayName.trim() !== userName
  const emailChanged = newEmail.trim() !== userEmail

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={handleClose} />

      {/* Side Panel */}
      <div className="fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-card border-l border-border shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#0dadb7]" />
            <h2 className="text-lg font-semibold">Account</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* User Info Card */}
          <div className="bg-[#F6F6F6] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#0dadb7]/20 flex items-center justify-center">
                <User className="h-5 w-5 text-[#0dadb7]" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {userName || userEmail.split("@")[0]}
                </p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-medium">
              Display name
            </Label>
            <div className="flex gap-2">
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />
              <Button
                size="sm"
                className="shrink-0 bg-[#4644B6] hover:bg-[#3532a0] text-white"
                disabled={!nameChanged || isSavingName}
                onClick={handleSaveName}
              >
                {isSavingName ? "Saving..." : nameSuccess ? (
                  <><Check className="h-4 w-4 mr-1" /> Saved</>
                ) : "Save"}
              </Button>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <Button
                size="sm"
                className="shrink-0 bg-[#4644B6] hover:bg-[#3532a0] text-white"
                disabled={!emailChanged || isSavingEmail}
                onClick={handleSaveEmail}
              >
                {isSavingEmail ? "Saving..." : "Save"}
              </Button>
            </div>
            {emailSuccess && (
              <p className="text-xs text-emerald-600">
                A confirmation link has been sent to your new email address.
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Password Section */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">Change password</p>

            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm text-muted-foreground">
                Current password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm text-muted-foreground">
                New password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground">
                Confirm new password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>

            <Button
              className="w-full bg-[#4644B6] hover:bg-[#3532a0] text-white"
              disabled={!currentPassword || !newPassword || !confirmPassword || isSavingPassword}
              onClick={handleChangePassword}
            >
              {isSavingPassword ? "Changing..." : passwordSuccess ? (
                <><Check className="h-4 w-4 mr-1" /> Password changed</>
              ) : "Change password"}
            </Button>
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
            Sign out
          </Button>
        </div>
      </div>
    </>
  )
}
