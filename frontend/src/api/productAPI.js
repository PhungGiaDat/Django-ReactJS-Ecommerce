import publicAPI from "./publicAPI";

export const fetchProducts = async () => {
    try {
        const response = await publicAPI.get("/api/products/public", {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            }
            
        });

        const formattedProducts = response.data.map(product => ({
            ...product,
            imageURL: product.image || "/default-image.jpg", // ảnh mặc định nếu k có ảnh
            formattedPrice : new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
            }).format(product.price)
        }))

        return formattedProducts;

    } catch (error) {
        console.error("Error fetching products", error);
        return [];
    }
};