export async function getAllProfiles(){
    return await fetch(`${process.env.NEXT_PUBLIC_FIREBASE_PROFILE_URL}`).then((response)=>{
        return response.json();
    }).then((response)=>{
        let profileArray = [];
        for(const key in response){
            profileArray.push(response[key]);
        }
        return profileArray;
    }).catch((err)=>{
        return err;
    })
}
export async function getProfileData(username){
    const email = username + "@gmail.com";
    const allProfiles = await getAllProfiles();
    return await allProfiles.find((profile) => profile.email === email);
}