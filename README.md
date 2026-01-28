# 3D Museum 

**Thời gian thực hiện: 04/2023 – 08/2023**

Website mô phỏng bảo tàng nghệ thuật 3D, cho phép người dùng điều hướng trong không gian 3D để xem tranh và tượng nổi tiếng thời Phục hưng cũng như các tác phẩm nghệ thuật kinh điển.

---

## Tổng quan

Dự án xây dựng một bảo tàng ảo chạy trên trình duyệt, sử dụng WebGL và Three.js để render cảnh 3D. Người dùng di chuyển trong phòng như góc nhìn người thứ nhất (FPS), xem tranh treo tường và các bức tượng, đồng thời có thể click chuột phải vào tác phẩm để xem tên và thông tin.

---

## Tính năng

- **Điều hướng FPS**: Di chuyển bằng phím W/A/S/D hoặc mũi tên, xoay góc nhìn bằng chuột (giữ chuột trái và kéo).
- **Không gian bảo tàng**: Kiến trúc mái, sàn, thảm đỏ, tường, cửa ra vào, hệ thống chiếu sáng.
- **Tranh nghệ thuật**: Nhiều bức tranh nổi tiếng (Picasso, Michelangelo, Leonardo da Vinci, Botticelli, …) treo trên tường với khung tranh và ánh sáng.
- **Tượng 3D**: Các bức tượng như Discobolus, Venus de Milo, Tượng thiên thần cầm đuốc (Lucy), Tượng thần chiến thắng Samothrace, với hiệu ứng xoay tròn.
- **Tương tác**: Click chuột phải vào tranh hoặc tượng để hiển thị popup tên tác phẩm / tượng.
- **Giới hạn di chuyển**: Người chơi chỉ di chuyển trong phòng, không đi xuyên tường hoặc qua cửa, không đi xuyên qua bục đặt tượng.
- **Trải nghiệm thoải mái**: FOV và tốc độ di chuyển, độ nhạy chuột và làm mượt xoay camera được tối ưu để giảm chóng mặt.

---

## Công nghệ sử dụng

| Thành phần   | Công nghệ                          |
|-------------|-------------------------------------|
| Frontend    | HTML, CSS, JavaScript  |
| Đồ họa 3D   | [Three.js](https://threejs.org/) (WebGL) |
| Loader 3D   | GLTFLoader, ColladaLoader, PLYLoader |
| Giao diện   | lil-gui (GUI điều chỉnh ánh sáng)   |

---

## Cấu trúc thư mục

```
3DMuseum/
├── index.html          # Trang chính, mount canvas 3D
├── src/
│   └── main.js         # Khởi tạo scene, camera, đèn, mô hình, tranh, logic tương tác
├── modules/
│   └── FPSController.mjs  # Điều khiển góc nhìn FPS, bounds, obstacles
├── models/             # Mô hình 3D (GLTF, PLY, DAE): tượng, cửa, đèn
├── textures/           # Texture sàn, thảm, tranh (paintings/)
└── README.md
```

---

## Điều khiển

| Hành động           | Cách thao tác                                      |
|---------------------|----------------------------------------------------|
| Di chuyển           | **W** / **A** / **S** / **D** hoặc **↑** / **←** / **↓** / **→** |
| Xoay góc nhìn       | **Giữ chuột trái** và kéo chuột                    |
| Xem thông tin tác phẩm | **Click chuột phải** vào tranh hoặc tượng     |
| Toàn màn hình        | Phím **F**                                         |

---


