
import multer from 'multer';
import path from 'path';

const  avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, 'avatar_' + Date.now() + path.extname(file.originalname))
    },
    fileFilter: function (req, file, cb) {
        const fileTypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetpye = fileTypes.test(file.mimetpye);
        
        if (mimetpye && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only');
        }

    }
})

const  faultStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, 'fault_' + Date.now() + path.extname(file.originalname))
  },
  fileFilter: function (req, file, cb) {
      const fileTypes = /jpeg|jpg|png/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetpye = fileTypes.test(file.mimetpye);
      
      if (mimetpye && extname) {
          return cb(null, true);
      } else {
          cb('Error: Images only');
      }

  }
})

const  taskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, 'task_' + Date.now() + path.extname(file.originalname))
  },
  fileFilter: function (req, file, cb) {
      const fileTypes = /jpeg|jpg|png/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetpye = fileTypes.test(file.mimetpye);
      
      if (mimetpye && extname) {
          return cb(null, true);
      } else {
          cb('Error: Images only');
      }

  }
})

const  documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, 'doc_' + Date.now() + path.extname(file.originalname))
  },
  fileFilter: function (req, file, cb) {
      const fileTypes = /doc|docx|pdf|xlsx|xls|txt|csv|ppt|pptx/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetpye = fileTypes.test(file.mimetpye);
      
      if (mimetpye && extname) {
          return cb(null, true);
      } else {
          cb('File type not allowed');
      }

  }
})

 export const uploadAvatar  = multer({ storage: avatarStorage });
 export const uploadFaultImage  = multer({ storage: faultStorage });
 export const uploadTaskImage  = multer({ storage: taskStorage });
 export const uploadDocument  = multer({ storage: documentStorage });
 