import fs from 'fs';

export const relocateFile = ( file, entityId, destFolder ) => {
    return new Promise((resolve, reject) => {
        
        let from = `${process.env.FS_LOCAL}/uploads/${file}`
        let to = `${process.env.FS_LOCAL}/${destFolder}/${entityId}/${file}`
        let url = `${process.env.BACKEND_URL}/${destFolder}/${entityId}/${file}`
        let entityDir = `${process.env.FS_LOCAL}/${destFolder}/${entityId}`;

        if (!fs.existsSync(entityDir)) {
            fs.mkdir(entityDir, function(err){ if (err) reject(err)});
        }
        fs.rename(from, to, function(err){ if(err) reject(err);})
        resolve(url);
    })
}