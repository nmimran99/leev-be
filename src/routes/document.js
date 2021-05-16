import { Router } from 'express';
import * as controller from '../controller/document';
import { uploadDocument } from '../services/multer.service';
import path from 'path';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { downloadFromBlob } from '../api/blobApi';

const router = Router();

router.post('/createDocument', authenticate, authorize, uploadDocument.single('file'), controller.createDocument);
router.post('/getDocument', authenticate, authorize, controller.getDocument);
router.post('/deleteDocument', authenticate, authorize, controller.deleteDocument);
router.post('/getDocuments', authenticate, authorize, controller.getDocuments);
router.post('/updateDocumentDetails', authenticate, authorize, controller.updateDocumentDetails);
// router.get('/download', authenticate, authorize, (req, res) => {
//     const { url } = req.query;
//     let filepath = url.replace(process.env.BACKEND_URL, 'public')
//     let filename = path.basename(filepath);
//     res.download(filepath, filename);
// })

router.get('/download', authenticate, authorize, downloadFromBlob)
export default router; 