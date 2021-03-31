import { Router } from 'express';
import * as controller from '../controller/document';
import { uploadDocument } from '../services/multer.service';
import path from 'path';

const router = Router();

router.post('/createDocument',uploadDocument.single('file'), controller.createDocument);
router.post('/getDocument', controller.getDocument);
router.post('/deleteDocument', controller.deleteDocument);
router.post('/getDocuments', controller.getDocuments);
router.get('/download', (req, res) => {
    const { url } = req.query;
    let filepath = url.replace(process.env.BACKEND_URL, 'public')
    let filename = path.basename(filepath);
    res.download(filepath, filename);
})


export default router; 