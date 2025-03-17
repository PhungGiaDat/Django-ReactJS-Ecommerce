import publicAPI from "./publicAPI";


export const fetchCategories = async () => {
    try {
        const response = await publicAPI.get("/api/categories");

        return response.data;

    } catch (error) {
        console.error("Error fetching categories", error);
        return [];
    }
}

