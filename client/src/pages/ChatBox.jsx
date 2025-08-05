import React, { useEffect, useRef, useState } from 'react';
import { dummyMessagesData, dummyUserData } from '../assets/assets';
import { ImageIcon, SendHorizonal } from 'lucide-react';

const ChatBox = () => {
  const messages = dummyMessagesData;
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(dummyUserData);

  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    // Message sending logic here
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    user && (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="flex items-center gap-2 p-3 md:px-10 bg-gradient-to-r from-indigo-100 to-purple-100 border-b border-gray-300">
          <img src={user.profile_picture} alt="" className="size-9 rounded-full" />
          <div>
            <p className="font-semibold text-slate-800">{user.full_name}</p>
            <p className="text-sm text-gray-500 -mt-1">@{user.username}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 md:px-10">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages
              .toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((message, index) => {
                const isOwn = message.to_user_id !== user._id;
                return (
                  <div
                    key={index}
                    className={`flex ${isOwn ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`p-3 max-w-sm text-sm rounded-lg shadow bg-white text-slate-700 ${
                        isOwn ? 'rounded-bl-none' : 'rounded-br-none'
                      }`}
                    >
                      {message.message_type === 'image' && (
                        <img
                          src={message.media_url}
                          alt="attachment"
                          className="w-full max-w-sm rounded-lg mb-2"
                        />
                      )}
                      <p>{message.text}</p>
                    </div>
                  </div>
                );
              })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input box */}
        <div className="px-4 pb-5 bg-gray-50">
          <div className="flex items-center gap-3 pl-5 pr-3 py-2 bg-white w-full max-w-2xl mx-auto border border-gray-200 shadow rounded-full">
            <input
              type="text"
              className="flex-1 text-sm text-slate-700 placeholder:text-gray-400 focus:outline-none"
              placeholder="Type a message"
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              onChange={(e) => setText(e.target.value)}
              value={text}
            />
            <label htmlFor="image" className="cursor-pointer">
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-6 h-6 rounded object-cover"
                />
              ) : (
                <ImageIcon className="w-5 h-5 text-gray-500" />
              )}
              <input
                type="file"
                id="image"
                accept="image/*"
                hidden
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
            <button onClick={sendMessage} className='bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full'>
              <SendHorizonal size ={18}/>
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ChatBox;
