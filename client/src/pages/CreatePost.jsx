import React, { useState } from 'react'
import { dummyUserData } from '../assets/assets'
import { Image, X } from 'lucide-react'
import toast from 'react-hot-toast'
const CreatePost = () => {
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const user = dummyUserData

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImages((prev) => [...prev, ...files])
  }
  const handleSubmit = async()=>{

  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Create Post</h1>
          <p className='text-slate-600'>Share your thoughts with the world</p>
        </div>

        {/* Form Card */}
        <div className='max-w-xl bg-white p-4 sm:p-8 rounded-xl shadow-md space-y-4'>
          {/* Header */}
          <div className='flex items-center gap-3'>
            <img
              className='w-12 h-12 rounded-full shadow'
              src={user.profile_picture}
              alt='profile'
            />
            <div>
              <h2 className='font-semibold'>{user.full_name}</h2>
              <p className='text-sm text-gray-500'>@{user.username}</p>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            className='w-full resize-none h-20 text-sm outline-none placeholder-gray-400 border border-gray-200 rounded-lg p-2'
            placeholder="What's happening?"
            onChange={(e) => setContent(e.target.value)}
            value={content}
          />

          {/* Images Preview */}
          {images.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {images.map((image, i) => (
                <div key={i} className='relative group w-32 h-20'>
                  <img
                    src={URL.createObjectURL(image)}
                    className='w-full h-full object-cover rounded-md'
                    alt='preview'
                  />
                  <div
                    onClick={() =>
                      setImages(images.filter((_, index) => index !== i))
                    }
                    className='absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer'
                  >
                    <X className='w-6 h-6 text-white' />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Bar */}
          <div className='flex items-center justify-between pt-3 border-t border-gray-300'>
            <label
              htmlFor='images'
              className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer'
            >
              <Image className='size-6' />
              Add Images
            </label>
            <input
              type='file'
              id='images'
              accept='image/*'
              hidden
              multiple
              onChange={handleImageChange}
            />

            <button
            onClick={()=>toast.promise(handleSubmit(),{
              loading:"Uploading...",
              success:<p>Post Added</p>,
              error:<p>Post Not Added</p>
            })}
              disabled={loading}
              className='text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-medium px-8 py-2 rounded-md cursor-pointer'
            >
              Publish Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
