extern crate image;
use image::{load_from_memory, imageops, ImageOutputFormat};

mod utils;

use wasm_bindgen::prelude::*;


#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn resizeImage(size: u32, binary_data: &[u8]) -> Vec<u8> {
    let image_result = load_from_memory(binary_data);
    return match image_result {
        Ok(img) => {
            img.resize(size, size, imageops::Nearest).to_bytes()
        },
        Err(_error) => vec!()
    }
}
