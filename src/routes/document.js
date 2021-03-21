import { Router } from 'express';
import * as controller from '../controller/document';
import { uploadDocument } from '../services/multer.service';

const router = Router();

router.post('/createDocument',uploadDocument.single('file'), controller.createDocument);
router.post('/getDocument', controller.getDocument);
router.post('/deleteDocument', controller.deleteDocument);
router.post('/getDocuments', controller.getDocuments);
router.get('/download', (req, res) => {
    const { url } = req.body;
    return res.download(url);
})


export default router; 