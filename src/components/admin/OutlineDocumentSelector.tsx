'use client'

import { useEffect, useState, useMemo } from 'react'
import { useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

interface OutlineDocument {
  id: string
  title: string
  updatedAt: string
}

const OutlineDocumentSelector: TextFieldClientComponent = ({ path, field }) => {
  const { value, setValue } = useField<string>({ path })
  const [documents, setDocuments] = useState<OutlineDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Fetch documents on mount
  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/outline/documents')

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to fetch documents')
        }

        const data = await response.json()
        setDocuments(data.documents || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load documents')
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  // Filter documents based on search
  const filteredDocuments = useMemo(() => {
    if (!search) return documents
    const searchLower = search.toLowerCase()
    return documents.filter((doc) => doc.title.toLowerCase().includes(searchLower))
  }, [documents, search])

  // Get selected document title
  const selectedDocument = documents.find((doc) => doc.id === value)

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        {typeof field.label === 'string' ? field.label : 'Outline Document'}
        {field.required && <span style={{ color: 'var(--theme-error-500)' }}> *</span>}
      </label>

      {field.admin?.description && typeof field.admin.description === 'string' && (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--theme-elevation-600)',
            marginBottom: '0.5rem',
            marginTop: 0,
          }}
        >
          {field.admin.description}
        </p>
      )}

      {error && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: 'var(--theme-error-100)',
            color: 'var(--theme-error-500)',
            borderRadius: '4px',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <div
          onClick={() => !loading && setIsOpen(!isOpen)}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--theme-elevation-50)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            opacity: loading ? 0.6 : 1,
          }}
        >
          <span style={{ color: selectedDocument ? 'inherit' : 'var(--theme-elevation-400)' }}>
            {loading ? 'Loading documents...' : selectedDocument?.title || 'Select a document...'}
          </span>
          <span style={{ fontSize: '0.75rem' }}>{isOpen ? '\u25B2' : '\u25BC'}</span>
        </div>

        {isOpen && !loading && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'var(--theme-elevation-0)',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              marginTop: '4px',
              zIndex: 100,
              maxHeight: '300px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--theme-elevation-150)' }}>
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--theme-elevation-150)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--theme-elevation-50)',
                  color: 'inherit',
                  fontSize: '0.875rem',
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div style={{ overflowY: 'auto', maxHeight: '240px' }}>
              {filteredDocuments.length === 0 ? (
                <div
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    color: 'var(--theme-elevation-400)',
                    fontSize: '0.875rem',
                  }}
                >
                  {search ? 'No documents match your search' : 'No published documents found'}
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setValue(doc.id)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      backgroundColor: doc.id === value ? 'var(--theme-elevation-100)' : 'transparent',
                      borderBottom: '1px solid var(--theme-elevation-100)',
                    }}
                    onMouseEnter={(e) => {
                      if (doc.id !== value) {
                        e.currentTarget.style.backgroundColor = 'var(--theme-elevation-50)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (doc.id !== value) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <div style={{ fontWeight: doc.id === value ? 500 : 400 }}>{doc.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-400)', marginTop: '2px' }}>
                      Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          onClick={() => {
            setIsOpen(false)
            setSearch('')
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
          }}
        />
      )}

      {selectedDocument && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--theme-elevation-500)' }}>
          Document ID: {value}
        </div>
      )}
    </div>
  )
}

export default OutlineDocumentSelector
