
import multer from 'multer';
import GridFsStorage from 'multer-gridfs-storage';
import path from 'path';

const storage = new GridFsStorage({
    url: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.axy2i.mongodb.net/leevdb`,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err)
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename, 
                    becketName: 'uploads'
                };
                resolve(fileInfo);
            })
        })
    }
});
 
export const upload = multer({ storage });