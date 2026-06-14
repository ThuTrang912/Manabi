# Hệ thống Upload Hình Ảnh cho Thẻ

## 🎯 Mục tiêu
Tạo hệ thống upload hình ảnh giống như upload avatar - upload file lên server, lưu URL vào database, hiển thị qua HTTP.

## 🚀 Những gì đã thực hiện:

### **Backend (Server-side):**

#### 1. **Server.js:**
- ✅ Thêm static file serving: `app.use("/uploads", express.static("uploads"))`
- ✅ Tạo thư mục `uploads/images/` tự động

#### 2. **cardController.js:**
- ✅ **Multer config cho images:**
  ```javascript
  const imageStorage = multer.diskStorage({
    destination: "uploads/images/",
    filename: 'image-' + timestamp + extension
  })
  
  export const uploadImage = multer({
    storage: imageStorage,
    fileFilter: [.jpg, .jpeg, .png, .gif, .webp],
    limits: 5MB
  })
  ```

- ✅ **API function:**
  ```javascript
  export const uploadImageFile = async (req, res) => {
    const imageUrl = `/uploads/images/${req.file.filename}`;
    res.json({ imageUrl, filename });
  }
  ```

#### 3. **cardRoutes.js:**
- ✅ **Route:** `POST /api/cards/upload/image`

### **Frontend (Client-side):**

#### 1. **AddCardModal.jsx:**
- ✅ **Upload function:**
  ```javascript
  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/cards/upload/image', {
      method: 'POST',
      body: formData
    });
    
    const { imageUrl } = await response.json();
    // Tạo HTML với URL server
    const imageHtml = `<img src="http://localhost:5001${imageUrl}" />`;
  }
  ```

#### 2. **index.css:**
- ✅ **Image styling:**
  - Flashcard: 100px x 100px
  - Vocabulary list: 70px x 70px
  - Responsive với border và shadow

#### 3. **CardSetPage.jsx:**
- ✅ Đã có `dangerouslySetInnerHTML` để render HTML
- ✅ CSS classes được apply tự động

## 📋 Cách sử dụng:

### **1. Chạy Backend:**
```bash
cd backend
node server.js
```

### **2. Chạy Frontend:**
```bash
cd frontend
npm run dev
```

### **3. Test Upload:**

1. **Vào CardSetPage** → Click "Thêm thẻ"
2. **Nhập nội dung** cho mặt trước/sau
3. **Click icon hình ảnh** ở một field
4. **Chọn trường** để thêm hình (front/back)
5. **Chọn file hình ảnh** từ máy
6. **File upload lên server** → Trả về URL
7. **HTML được tạo** với URL server
8. **Click "Thêm"** để lưu thẻ

### **4. Kiểm tra kết quả:**

✅ **File vật lý:** `backend/uploads/images/image-123456789.jpg`
✅ **Database:** HTML chứa URL server thay vì base64
✅ **Flashcard view:** Hình ảnh 100px với border/shadow
✅ **Vocabulary list:** Hình ảnh 70px inline
✅ **Loading performance:** Nhanh hơn vì không có base64

## 🔧 Luồng dữ liệu:

```
User chọn hình → Upload lên server → Server trả URL 
    ↓
HTML được tạo với URL → Lưu vào database
    ↓
CardSetPage fetch data → Render HTML → Browser load hình từ URL
```

## 🎨 Styling:

```css
/* Flashcard */
.card-content img, .field-content img {
  max-width: 100px !important;
  max-height: 100px !important;
  border: 2px solid #e5e7eb !important;
  border-radius: 8px !important;
}

/* Vocabulary List */  
.list-view img {
  max-width: 70px !important;
  max-height: 70px !important;
  display: inline-block !important;
  margin: 4px 8px 4px 0 !important;
}
```

## ✨ Ưu điểm:

✅ **Hiệu suất cao:** File binary thay vì base64 text
✅ **Database nhẹ:** Chỉ lưu URL thay vì data
✅ **Caching:** Browser cache được hình ảnh
✅ **Scalable:** Có thể deploy lên CDN
✅ **Consistent:** Logic giống upload avatar

## 🐛 Debug:

### **Test API trực tiếp:**
```bash
curl -X POST http://localhost:5001/api/cards/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@path/to/image.jpg"
```

### **Kiểm tra file:**
- File có trong `backend/uploads/images/` không?
- URL access được: `http://localhost:5001/uploads/images/filename.jpg`?

### **Console logs:**
- Network tab: Upload request thành công?
- Database: HTML content có URL server?
- CSS: Image styles được apply?

## 📁 Cấu trúc file:

```
backend/
  uploads/
    images/
      image-1642xxx-123.jpg  ← File vật lý
  src/
    controllers/cardController.js  ← Upload logic
    routes/cardRoutes.js          ← API route
  server.js                       ← Static serving

frontend/
  src/
    components/AddCardModal.jsx   ← Upload UI
    pages/CardSetPage.jsx         ← Display images
  index.css                       ← Image styling
```

**Hoàn thành! Hệ thống upload hình ảnh đã sẵn sàng sử dụng! 🎉**
