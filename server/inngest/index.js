const { Inngest } = require('inngest');
const User = require('../models/User');

// Initialize Inngest
const inngest = new Inngest({ id: "pingup-app" });

//inngest function to save user in database

const syncUserCreation = inngest.createFunction(
    {id:"sync-user-from-clerk"},
    {event:"clerk/user.created"},

    async({event})=>{
        const {id,first_name,last_name,email_addresses,image_url} = event.data
        let username = email_addresses[0].email_address.split("@")[0]

        const user = await User.findOne({username})
        if(user){
            username = username + Math.floor(Math.random()*10000)
        }
        const userData = {
            _id:id,
            email:email_addresses[0].email_address,
            full_name:first_name + last_name,
            profile_picture:image_url,
            username
        }
        await User.create(userData)
    }
)

//inngest functon to update user in database


const syncUserUpdation = inngest.createFunction(
    {id:"update-user-from-clerk"},
    {event:"clerk/user.updated"},

    async({event})=>{
        const {id,first_name,last_name,email_addresses,image_url} = event.data
       
        const updatedUserData = {
            email:email_addresses[0].email_address,
            full_name:first_name + " " + last_name,
            profile_picture:image_url
        }
        await User.findByIdAndUpdate(id,updatedUserData)

    }
)


const syncUserDeletion = inngest.createFunction(
    {id:"delete-user-with-clerk"},
    {event:"clerk/user.deleted"},

    async({event})=>{
        const {id} = event.data;
        await User.findByIdAndDelete(id)
       
    }
)


// Export Inngest and an empty function list (you'll add to this later)
module.exports = {
  inngest,
  functions: [syncUserCreation,syncUserUpdation,syncUserDeletion]
};
