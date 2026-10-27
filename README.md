# Shiro OS — KenzoGz

Trang cá nhân dạng desktop/CRT, xây bằng HTML, CSS và JavaScript thuần.

## Mở rộng nội dung

- `data/site-copy.json`: các câu chữ ở màn hình chính, About, Fiction, thought, status và little things.
- `data/assets.json`: đường dẫn wallpaper, avatar, favicon và GIF.
- `content/projects/projects.json`: danh sách Projects.
- `content/experiments/experiments.json`: danh sách Experiments.
- `content/archive/archive.json`: danh sách Archive.
- Mỗi thư mục collection có `README.md` với ví dụ dữ liệu và các trường hỗ trợ.

Thêm nội dung bằng cách sửa các file JSON tương ứng; các collection tự render thành thẻ. Asset mới đặt trong `assets/images/`, sau đó thêm đường dẫn vào `data/assets.json` nếu trang cần dùng tới.

## Chạy local

Trang tải JSON qua `fetch`, vì vậy hãy dùng local web server hoặc static hosting thay vì mở `index.html` bằng `file://`.

Không cần build step hay backend.

## Công nghệ

- HTML5
- CSS3
- Vanilla JavaScript
