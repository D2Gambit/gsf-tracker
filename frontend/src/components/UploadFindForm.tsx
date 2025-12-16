import React, { useState, useEffect } from 'react';

type UploadForm = {
  name: string
  description: string
  foundBy: string
  image: File | null
}

export default function UploadFindForm({ isModalOpen, setIsModalOpen, onUploadSuccess }: { isModalOpen: boolean, setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>, onUploadSuccess: () => void }) {

    const [form, setForm] = useState<UploadForm>({
        name: '',
        description: '',
        foundBy: '',
        image: null,
    })

    const handleUploadConfirmClick = async () => {

        const uploadData = new FormData()
        uploadData.append('image', form.image!)
        uploadData.append('name', form.name)
        uploadData.append('description', form.description)
        uploadData.append('foundBy', form.foundBy)
        uploadData.append('gsfGroupId', 'CariGSF') // Replace with actual group ID

        try {
            const res = await fetch('/api/upload-finds', {
            method: 'POST',
            body: uploadData
            })

            if (!res.ok) {
            throw new Error('Request failed')
            }

            const responseData = await res.json()
            onUploadSuccess()
            setIsModalOpen(false)
        } catch (err) {
            console.error('Error calling backend:', err)
        }
    }
    
    useEffect(() => {
        if (!isModalOpen) return

        const handlePaste = (e: ClipboardEvent) => {
        const items = e.clipboardData?.items
        if (!items) return

        for (const item of items) {
            if (item.type.startsWith('image')) {
            const file = item.getAsFile()
            if (file) {
                setForm(prev => ({ ...prev, image: file }))
            }
            }
        }
        }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [isModalOpen])

    return ( 
       (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="bg-zinc-800 w-full max-w-lg rounded-lg p-6">
                  <h3 className="text-xl font-bold text-zinc-100 mb-4">
                    Upload New Find
                  </h3>

                  {/* Image preview */}
                  <div className="mb-4 border border-dashed border-zinc-500 rounded p-4 text-center">
                    {form.image ? (
                      <img
                        src={URL.createObjectURL(form.image)}
                        alt="Preview"
                        className="mx-auto max-h-48 rounded"
                      />
                    ) : (
                      <p className="text-zinc-400 text-sm">
                        Paste an image from clipboard (Ctrl + V)
                      </p>
                    )}
                  </div>

                  {/* Name */}
                  <input
                    type="text"
                    placeholder="Item Name"
                    className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />

                  {/* Description */}
                  <textarea
                    placeholder="Description"
                    className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />

                  {/* Found By */}
                  <input
                    type="text"
                    placeholder="Found by"
                    className="w-full mb-4 p-2 rounded bg-zinc-700 text-zinc-100"
                    value={form.foundBy}
                    onChange={e => setForm({ ...form, foundBy: e.target.value })}
                  />

                  {/* Actions */}
                  <div className="flex justify-end space-x-3">
                    <button
                      className="px-4 py-2 rounded bg-zinc-600 text-zinc-100"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>

                    <button
                      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                      onClick={handleUploadConfirmClick}
                      disabled={!form.name}
                    >
                      Confirm Upload
                    </button>
                  </div>
                </div>
              </div>
            )
            
    );
};