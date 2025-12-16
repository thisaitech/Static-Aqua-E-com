'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchAndLogCategories()
  }, [])

  const fetchAndLogCategories = async () => {
    console.log('=== TESTING CATEGORIES FETCH ===')
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      console.log('Raw response - error:', error)
      console.log('Raw response - data:', data)
      
      if (error) {
        console.error('Database error:', error)
        return
      }

      if (data) {
        console.log('Number of categories:', data.length)
        data.forEach((cat, index) => {
          console.log(`\n--- Category ${index + 1}: ${cat.name} ---`)
          console.log('ID:', cat.id)
          console.log('Types:', cat.types)
          console.log('Types type:', typeof cat.types)
          console.log('Is Array?:', Array.isArray(cat.types))
          console.log('Length:', cat.types?.length)
          console.log('JSON stringify:', JSON.stringify(cat.types))
        })
        setCategories(data)
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Categories Debug Page</h1>
        
        <button
          onClick={fetchAndLogCategories}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh & Log to Console
        </button>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-xl font-bold mb-4">{category.name}</h2>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>ID:</strong> {category.id}
                  </div>
                  <div>
                    <strong>Types (raw):</strong> {JSON.stringify(category.types)}
                  </div>
                  <div>
                    <strong>Types type:</strong> {typeof category.types}
                  </div>
                  <div>
                    <strong>Is Array?:</strong> {Array.isArray(category.types) ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Length:</strong> {category.types?.length || 0}
                  </div>
                  
                  {Array.isArray(category.types) && category.types.length > 0 && (
                    <div className="mt-4">
                      <strong>Types List:</strong>
                      <ul className="list-disc list-inside ml-4 mt-2">
                        {category.types.map((type: string, idx: number) => (
                          <li key={idx}>{type}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-bold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Open browser console (F12)</li>
            <li>Click "Refresh & Log to Console" button</li>
            <li>Check console for detailed logging of category data</li>
            <li>Verify types are being stored and retrieved correctly</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
