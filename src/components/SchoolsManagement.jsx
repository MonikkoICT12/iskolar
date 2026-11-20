import { useState } from 'react'
import { Plus, Edit2, Trash2, School } from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const SchoolsManagement = () => {
  const {
    getSchoolsList,
    addSchool,
    updateSchoolName,
    deleteSchool,
    validateSchoolInUse,
    getScholarsBySchool,
  } = useScholarStore()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [newSchoolName, setNewSchoolName] = useState('')
  const [editSchoolName, setEditSchoolName] = useState('')

  const schools = getSchoolsList()

  const handleAddSchool = () => {
    if (!newSchoolName.trim()) return
    const result = addSchool(newSchoolName.trim())
    if (result) {
      setNewSchoolName('')
      setIsAddModalOpen(false)
    }
  }

  const handleEditSchool = async () => {
    if (!editSchoolName.trim() || !selectedSchool) return
    const ok = await updateSchoolName(selectedSchool, editSchoolName.trim())
    if (ok) {
      setEditSchoolName('')
      setSelectedSchool(null)
      setIsEditModalOpen(false)
    }
  }

  const handleDeleteSchool = () => {
    if (!selectedSchool) return
    const result = deleteSchool(selectedSchool)
    if (result) {
      setSelectedSchool(null)
      setIsDeleteModalOpen(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">
            Schools Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Add, edit, or remove partner schools and universities in the system.
          </p>
        </div>
        <Button variant="gradient" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Add School
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>School / University</TableHead>
              <TableHead className="text-center">Scholars</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-12 text-center text-muted-foreground">
                  <School className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No schools added yet. Click &ldquo;Add School&rdquo; to get started.</p>
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => {
                const scholarCount = getScholarsBySchool(school).length
                return (
                  <TableRow key={school}>
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-3">
                        <School className="w-4 h-4 text-brand" />
                        <span>{school}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default">
                        {scholarCount} {scholarCount === 1 ? 'scholar' : 'scholars'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedSchool(school)
                            setEditSchoolName(school)
                            setIsEditModalOpen(true)
                          }}
                          title="Edit school name"
                        >
                          <Edit2 className="w-4 h-4 text-brand" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedSchool(school)
                            setIsDeleteModalOpen(true)
                          }}
                          className="text-red-600 hover:bg-red-50"
                          title="Delete school"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add School</DialogTitle>
            <DialogDescription>
              Register a new university or college name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="add-school-input">School / University Name</Label>
            <Input
              id="add-school-input"
              type="text"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSchool()}
              placeholder="e.g., Nueva Ecija University of Science and Technology"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleAddSchool}
              disabled={!newSchoolName.trim()}
            >
              Add School
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit School Name</DialogTitle>
            <DialogDescription>
              Updates the school name for all{' '}
              {selectedSchool ? getScholarsBySchool(selectedSchool).length : 0}{' '}
              scholar(s) using this school.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="manage-edit-school">School / University Name</Label>
            <Input
              id="manage-edit-school"
              type="text"
              value={editSchoolName}
              onChange={(e) => setEditSchoolName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEditSchool()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleEditSchool}
              disabled={!editSchoolName.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete School</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {selectedSchool && validateSchoolInUse(selectedSchool) ? (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-1">
                <p className="font-semibold text-sm text-red-700">
                  Cannot delete this school
                </p>
                <p className="text-xs text-red-900/80">
                  There are {getScholarsBySchool(selectedSchool).length} scholar(s)
                  still assigned to this school.
                </p>
              </div>
            ) : (
              <p className="text-sm text-foreground">
                Are you sure you want to delete <strong>{selectedSchool}</strong>?
                This action cannot be undone.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            {selectedSchool && !validateSchoolInUse(selectedSchool) && (
              <Button variant="destructive" onClick={handleDeleteSchool}>
                Delete School
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SchoolsManagement
