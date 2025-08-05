import React, { useState } from 'react'
import { dummyUserData } from '../assets/assets'
import { Pencil } from 'lucide-react'

const ProfileModel = ({setShowEdit}) => {
  const user = dummyUserData
  const [editForm, setEditForm] = useState({
    username: user.username,
    bio: user.bio,
    location: user.location,
    profile_picture: null,
    full_name: user.full_name,
    cover_photo: null,
  })

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    // Save logic
  }

  return (
    <div className='fixed inset-0 z-[110] h-screen overflow-y-auto bg-black/50 flex justify-center items-start pt-10'>
      <div className='w-full max-w-2xl bg-white rounded-lg shadow-lg p-6'>
        <h1 className='text-2xl font-bold text-gray-900 mb-6'>Edit Profile</h1>
        <form className='space-y-6' onSubmit={handleSaveProfile}>
          
          {/* Profile Picture Upload */}
          <div className='flex flex-col items-start'>
            <label htmlFor="profile_picture" className='text-sm font-medium text-gray-700 mb-2'>
              Profile Picture
            </label>
            <div className='relative group cursor-pointer'>
              <img
                className='w-24 h-24 rounded-full object-cover border border-gray-200'
                src={
                  editForm.profile_picture
                    ? URL.createObjectURL(editForm.profile_picture)
                    : user.profile_picture
                }
                alt="Profile"
              />
              <div className='absolute inset-0 bg-black/30 rounded-full hidden group-hover:flex items-center justify-center transition'>
                <Pencil className='w-5 h-5 text-white' />
              </div>
              <input
                type="file"
                id="profile_picture"
                accept='image/*'
                hidden
                onChange={(e) =>
                  setEditForm({ ...editForm, profile_picture: e.target.files[0] })
                }
              />
            </div>
          </div>

          {/* Cover Photo Upload */}
          <div className='flex flex-col items-start'>
            <label htmlFor="cover_photo" className='text-sm font-medium text-gray-700 mb-2'>
              Cover Photo
            </label>
            <div className='relative group cursor-pointer'>
              <img
                className="w-full h-40 rounded-lg object-cover bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200"
                src={
                  editForm.cover_photo
                    ? URL.createObjectURL(editForm.cover_photo)
                    : user.cover_photo
                }
                alt="Cover"
              />
              <div className='absolute inset-0 bg-black/20 rounded-lg hidden group-hover:flex items-center justify-center transition'>
                <Pencil className='w-6 h-6 text-white' />
              </div>
              <input
                type="file"
                id="cover_photo"
                accept='image/*'
                hidden
                onChange={(e) =>
                  setEditForm({ ...editForm, cover_photo: e.target.files[0] })
                }
              />
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
                Name
            </label>
            <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter your full name' onChange={(e)=>setEditForm({...editForm,full_name:e.target.value})} value={editForm.full_name} />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
                Username
            </label>
            <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter a username' onChange={(e)=>setEditForm({...editForm,username:e.target.value})} value={editForm.username} />
          </div>
           <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Bio
            </label>
            <textarea rows={3}  className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter a short bio' onChange={(e)=>setEditForm({...editForm,bio:e.target.value})} value={editForm.bio} />
          </div>
           <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Location
            </label>
            <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter your location' onChange={(e)=>setEditForm({...editForm,location:e.target.value})} value={editForm.location} />
            
          </div>
          <div className='flex justify-end space-x-3 pt-6'>
            <button type='button' onClick={()=>setShowEdit(false)} className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'>Cancel</button>
            <button type='submit' className='px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition cursor-pointer'>Save Changes</button>

          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileModel
