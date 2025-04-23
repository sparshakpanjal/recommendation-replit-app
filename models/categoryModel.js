import { createClient } from '@supabase/supabase-js';

// 🔐 Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase credentials missing from environment variables.");
  throw new Error("Supabase URL or ANON KEY is missing.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 🛠️ Centralized error handler
const handleError = (action, error) => {
  console.error(`❌ ${action} | Supabase Error:`, error.message);
  throw new Error(`${action} failed: ${error.message}`);
};

// ➕ Create category
export const createCategory = async (title, slug) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ title, slug }])
      .select()
      .single();

    if (error) handleError("Create Category", error);
    return data;
  } catch (err) {
    console.error("🔥 Unexpected error in createCategory:", err.message);
    throw err;
  }
};

// 📥 Get all categories
export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) handleError("Fetch Categories", error);
    return data;
  } catch (err) {
    console.error("🔥 Unexpected error in getCategories:", err.message);
    throw err;
  }
};

// 🔁 Update category
export const updateCategory = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) handleError("Update Category", error);
    return data;
  } catch (err) {
    console.error("🔥 Unexpected error in updateCategory:", err.message);
    throw err;
  }
};

// 🗑️ Delete category
export const deleteCategory = async (id) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) handleError("Delete Category", error);
    return data;
  } catch (err) {
    console.error("🔥 Unexpected error in deleteCategory:", err.message);
    throw err;
  }
};
