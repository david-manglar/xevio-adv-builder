"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, User, RefreshCw, ChevronDown, ChevronUp, Trash2, Ban, CheckCircle, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AdminUser {
  id: string
  email: string
  displayName: string
  createdAt: string
  lastSignInAt: string | null
  campaigns: {
    total: number
    drafted: number
    completed: number
  }
  role: string
  banned: boolean
}

interface AdminPanelProps {
  userId: string | null
  onBack: () => void
}

export function AdminPanel({ userId, onBack }: AdminPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)

  const fetchUsers = async () => {
    if (!userId) return
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`)
      if (!response.ok) {
        throw new Error(response.status === 403 ? "Unauthorized" : "Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [userId])

  const totalCampaigns = users.reduce((sum, u) => sum + u.campaigns.total, 0)
  const totalDrafted = users.reduce((sum, u) => sum + u.campaigns.drafted, 0)
  const totalCompleted = users.reduce((sum, u) => sum + u.campaigns.completed, 0)

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-md hover:bg-muted text-muted-foreground"
            onClick={onBack}
            title="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <ShieldCheck className="h-6 w-6 text-[#0dadb7]" />
          <h1 className="text-2xl font-semibold text-foreground">Admin Panel</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total users" value={users.length} />
        <StatCard label="Total campaigns" value={totalCampaigns} />
        <StatCard label="Drafted" value={totalDrafted} />
        <StatCard label="Completed" value={totalCompleted} />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && users.length === 0 && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          Loading users...
        </div>
      )}

      {/* User List */}
      {!isLoading && users.length === 0 && !error && (
        <p className="text-center text-muted-foreground py-16">No users found</p>
      )}

      <div className="space-y-3">
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            isExpanded={expandedUserId === user.id}
            isSelf={user.id === userId}
            onToggle={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
            requestingUserId={userId!}
            onUserUpdated={fetchUsers}
          />
        ))}
      </div>
    </div>
  )
}

// --- Stat Card ---

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#F6F6F6] rounded-lg p-4 text-center">
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

// --- User Row ---

interface UserRowProps {
  user: AdminUser
  isExpanded: boolean
  isSelf: boolean
  onToggle: () => void
  requestingUserId: string
  onUserUpdated: () => void
}

function UserRow({ user, isExpanded, isSelf, onToggle, requestingUserId, onUserUpdated }: UserRowProps) {
  return (
    <div className="bg-[#F6F6F6] rounded-lg overflow-hidden">
      {/* Summary Row */}
      <button
        className="w-full flex items-center gap-4 p-4 hover:bg-black/[0.03] transition-colors text-left"
        onClick={onToggle}
      >
        <div className="h-10 w-10 rounded-full bg-[#0dadb7]/20 flex items-center justify-center shrink-0">
          <User className="h-5 w-5 text-[#0dadb7]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              {user.displayName || user.email.split("@")[0]}
            </p>
            {user.role === "admin" && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Admin</Badge>
            )}
            {user.banned && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Disabled</Badge>
            )}
            {isSelf && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">You</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground shrink-0">
          <span>Registered {formatDate(user.createdAt)}</span>
          <span>Last active {user.lastSignInAt ? formatDate(user.lastSignInAt) : "Never"}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user.campaigns.total}</p>
            <p className="text-[10px] text-muted-foreground">campaigns</p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <UserDetails
          user={user}
          isSelf={isSelf}
          requestingUserId={requestingUserId}
          onUserUpdated={onUserUpdated}
        />
      )}
    </div>
  )
}

// --- User Details (expanded) ---

interface UserDetailsProps {
  user: AdminUser
  isSelf: boolean
  requestingUserId: string
  onUserUpdated: () => void
}

function UserDetails({ user, isSelf, requestingUserId, onUserUpdated }: UserDetailsProps) {
  const [editName, setEditName] = useState(user.displayName)
  const [editEmail, setEditEmail] = useState(user.email)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleUpdate = async (fields: Record<string, unknown>, label: string) => {
    setSaving(label)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestingUserId, ...fields }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Update failed')
      setSuccess(`${label} updated`)
      setTimeout(() => setSuccess(""), 3000)
      onUserUpdated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(null)
    }
  }

  const handleDelete = async () => {
    setSaving("delete")
    setError("")

    try {
      const response = await fetch(`/api/admin/users/${user.id}?userId=${requestingUserId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Delete failed')
      onUserUpdated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setSaving(null)
    }
  }

  const nameChanged = editName.trim() !== user.displayName
  const emailChanged = editEmail.trim() !== user.email

  return (
    <div className="px-4 pb-4 pt-0 border-t border-border/50">
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Info */}
        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground">User details</p>
          <DetailRow label="User ID" value={user.id} mono />
          <DetailRow label="Registered" value={formatDate(user.createdAt)} />
          <DetailRow label="Last sign-in" value={user.lastSignInAt ? formatDate(user.lastSignInAt) : "Never"} muted={!user.lastSignInAt} />
          <DetailRow label="Role" value={user.role} />
          <DetailRow label="Status" value={user.banned ? "Disabled" : "Active"} />

          <div className="pt-2 border-t border-border/50">
            <p className="text-xs font-medium text-foreground mb-2">Campaign activity</p>
            <div className="flex gap-2">
              <MiniStat label="Total" value={user.campaigns.total} />
              <MiniStat label="Drafted" value={user.campaigns.drafted} />
              <MiniStat label="Completed" value={user.campaigns.completed} />
            </div>
          </div>
        </div>

        {/* Right: Edit */}
        <div className="space-y-4">
          <p className="font-medium text-foreground text-sm">Edit user</p>

          {/* Feedback */}
          {error && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
              <CheckCircle className="h-3 w-3 shrink-0" />
              {success}
            </div>
          )}

          {/* Display Name */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Display name</Label>
            <div className="flex gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Display name"
                className="h-9 text-sm"
              />
              <Button
                size="sm"
                className="shrink-0 bg-[#4644B6] hover:bg-[#3532a0] text-white h-9"
                disabled={!nameChanged || saving === "name"}
                onClick={() => handleUpdate({ displayName: editName.trim() }, "Name")}
              >
                {saving === "name" ? "..." : "Save"}
              </Button>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="h-9 text-sm"
              />
              <Button
                size="sm"
                className="shrink-0 bg-[#4644B6] hover:bg-[#3532a0] text-white h-9"
                disabled={!emailChanged || saving === "email"}
                onClick={() => handleUpdate({ email: editEmail.trim() }, "Email")}
              >
                {saving === "email" ? "..." : "Save"}
              </Button>
            </div>
          </div>

          {/* Password Reset */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Reset password</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="h-9 text-sm pr-9"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              <Button
                size="sm"
                className="shrink-0 bg-[#4644B6] hover:bg-[#3532a0] text-white h-9"
                disabled={!newPassword || newPassword.length < 6 || saving === "password"}
                onClick={() => {
                  handleUpdate({ password: newPassword }, "Password")
                  setNewPassword("")
                }}
              >
                {saving === "password" ? "..." : "Reset"}
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          {!isSelf && (
            <div className="pt-3 border-t border-border/50 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Danger zone</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-xs"
                  disabled={saving === "ban"}
                  onClick={() => handleUpdate({ banned: !user.banned }, user.banned ? "Status" : "Status")}
                >
                  <Ban className="h-3.5 w-3.5 mr-1.5" />
                  {user.banned ? "Enable user" : "Disable user"}
                </Button>
                {!confirmDelete ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete user
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 h-9 text-xs"
                    disabled={saving === "delete"}
                    onClick={handleDelete}
                  >
                    {saving === "delete" ? "Deleting..." : "Confirm delete"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Helper Components ---

function DetailRow({ label, value, mono, muted }: { label: string; value: string; mono?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className={`text-xs text-right break-all ${mono ? "font-mono text-[11px]" : ""} ${muted ? "text-muted-foreground italic" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 bg-white rounded-md p-2 text-center">
      <p className="text-sm font-semibold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${day} ${month} ${year}, ${hours}:${minutes}`
}
