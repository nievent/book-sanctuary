"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { AddBookModal } from "@/components/modals/AddBookModal"

export function QuickActions() {
  const [showAddBook, setShowAddBook] = useState(false)

  return (
    <>
      <section className="flex gap-4">
        <button
          onClick={() => setShowAddBook(true)}
          className="btn-primary flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Añadir Libro
        </button>
      </section>

      <AddBookModal 
        isOpen={showAddBook}
        onClose={() => setShowAddBook(false)}
      />
    </>
  )
}