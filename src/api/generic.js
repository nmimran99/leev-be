import fs from 'fs';
import path from 'path';



export const relocateFile = ( file, entityId, destFolder ) => {
    return new Promise((resolve, reject) => {
        let from = `${publicFolder}/uploads/${file}`
        let to = `${publicFolder}/${destFolder}/${entityId}/${file}`
        let url = `${process.env.BACKEND_URL}/${destFolder}/${entityId}/${file}`
        let entityDir = `${publicFolder}/${destFolder}/${entityId}`;

        if (!fs.existsSync(entityDir)) {
            fs.mkdir(entityDir, function(err){ if (err) reject(err)});
        }
        fs.rename(from, to, function(err){ if(err) reject(err);})
        resolve(url);
    })
}

export const removeUnlistedImages = (URLs, module, parent) => {
    if (!URLs) return;
    let basenames = [];
    URLs.forEach((item, i) => {
        URLs[i] = item.replace(process.env.BACKEND_URL, publicFolder)
        basenames[i] = path.basename(item);
    });
    const dir = URLs.length ? path.dirname(URLs[0]) : path.join(publicFolder, module, parent);

    if (!basenames.length) {
        fs.rmdirSync(dir, { recursive: true });
        return;
    }
    fs.readdir(dir, function(err, files){
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        };
        files.forEach(function (file) {
            if (basenames.indexOf(file) === -1) {
                fs.unlink(path.join(dir, file), function(err){
                    if (err)
                        console.log(err)
                })
            }
        }); 
    });
}

export const removeFile = async (module, parent, filename) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(publicFolder, module, parent, filename);
        if (!fs.existsSync(filePath)) resolve(true);
        fs.unlink(filePath, function(err){
            if (err)
                console.log(err)
        });
        console.log(filePath, ' was removed');
        resolve(true);
    })
    
}

export const removeFileByPath = async (filepath) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filepath)) resolve(true);
        fs.unlink(filepath, function(err){
            if (err)
                console.log(err)
        });
        console.log(filepath, ' was removed');
        resolve(true);
    })
    
}
export const removeDuplicateObjectIds = inputArray => {
    const sortedArray = inputArray.sort((a,b) => (a.toString() > b.toString() ? 1 : (a.toString() < b.toString() ? -1 : 0)));

    let lastSeen = null;
    return sortedArray.reduce((sum, element) => {
       if(lastSeen != element){
           sum.push(element);
       }
       lastSeen = element;
       return sum;
    }, []);
};

export const getUnauthorizedMessage = () => {
	return { error: true, reason: 'unauthorized', status: 403 }
};


export const createURL = async (fileName) => {
    return `${process.env.BLOB_IMAGES_URL}/${fileName}`
}