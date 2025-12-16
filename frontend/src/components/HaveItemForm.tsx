import React, { useState } from 'react';

type AddHaveItemForm = {
  itemName: string
  description: string
  foundBy: string
  quality: string
  location: string
}

export default function HaveItemForm({ isModalOpen, setIsModalOpen, haveItems, setHaveItems, addItem }: { isModalOpen: boolean, setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>, haveItems: any[], setHaveItems: React.Dispatch<React.SetStateAction<any[]>>, addItem: (id: string) => void }) {

    const [form, setForm] = useState<AddHaveItemForm>({
        itemName: '',
        description: '',
        foundBy: '',
        quality: '',
        location: ''
    })

    const handleAddHaveItemConfirmClick = async () => {
        try {
            const res = await fetch('/api/add-have-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form)
            })

            if (!res.ok) {
            throw new Error('Request failed')
            }
            
            setHaveItems([...haveItems, { ...form, dateFound: new Date(Date.now()).toLocaleDateString('en-CA')}])
            setIsModalOpen(false)
            addItem('1')
            const data = await res.json()
            console.log('Form Data', form)
            console.log('Backend response:', data)
        } catch (err) {
            console.error('Error calling backend:', err)
        }
    }

    return ( 
       (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="bg-zinc-800 w-full max-w-lg rounded-lg p-6">
                  <h3 className="text-xl font-bold text-zinc-100 mb-4">
                    Add Have Item
                  </h3>

                  {/* Name */}
                  <input
                    type="text"
                    placeholder="Item Name"
                    className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
                    value={form.itemName}
                    onChange={e => setForm({ ...form, itemName: e.target.value })}
                  />

                  {/* Description */}
                  <textarea
                    placeholder="Description"
                    className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />

                  {/* Quality*/}
                  <label className="block mb-2 text-sm font-medium text-zinc-100">Quality</label>
                  <select
                    className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
                    value={form.quality}
                    onChange={e => setForm({ ...form, quality: e.target.value })}
                  >
                    <option value="">Select Quality</option>
                    <option value="Normal">Normal</option>
                    <option value="Magic">Magic</option>
                    <option value="Rare">Rare</option>
                    <option value="Unique">Unique</option>
                    <option value="Set">Set</option>
                  </select>

                  {/* Found By */}
                  <input
                    type="text"
                    placeholder="Found by"
                    className="w-full mb-4 p-2 rounded bg-zinc-700 text-zinc-100"
                    value={form.foundBy}
                    onChange={e => setForm({ ...form, foundBy: e.target.value })}
                  />

                   {/* Location */}
                  <input
                    type="text"
                    placeholder="Location"
                    className="w-full mb-4 p-2 rounded bg-zinc-700 text-zinc-100"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
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
                      onClick={handleAddHaveItemConfirmClick}
                      disabled={!form.itemName}
                    >
                      Add Have Item
                    </button>
                  </div>
                </div>
              </div>
            )
            
    );
};