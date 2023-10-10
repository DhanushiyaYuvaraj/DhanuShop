import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageDelete = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    // Fetch products from Firebase and set them in the 'products' state.
    async function fetchProducts() {
      try {
        const response = await axios.get(
          'https://firestore.googleapis.com/v1/projects/d-richie-computers/databases/(default)/documents/products'
        );
        const productData = response.data.documents.map((doc) => ({
          id: doc.name.split('/').pop(),
          ...doc.fields,
        }));
        setProducts(productData);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }

    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    try {
      // Delete the product from Firebase.
      await axios.delete(
        `https://firestore.googleapis.com/v1/projects/d-richie-computers/databases/(default)/documents/products/${productId}`
      );

      // Remove the product from the displayed products.
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (productId) => {
    // Set the 'editingProduct' state to the ID of the product being edited.
    setEditingProduct(productId);
  };

  const handleSaveEdit = async (productId, updatedProduct) => {
    try {
      // Update the product in Firebase.
      await axios.patch(
        `https://firestore.googleapis.com/v1/projects/d-richie-computers/databases/(default)/documents/products/${productId}`,
        {
          fields: {
            name: { stringValue: updatedProduct.name },
            description: { stringValue: updatedProduct.description },
            price: { doubleValue: parseFloat(updatedProduct.price) },
            quantity: {
              integerValue: parseInt(updatedProduct.quantity, 10),
            },
          },
        }
      );

      // Update the displayed products and clear the editing state.
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId ? updatedProduct : product
        )
      );
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <div>
      <h2>Products</h2>
      {products.map((product) => (
        <div key={product.id} className="product-box">
          <h3>{product.fields.name.stringValue}</h3>
          <p>{product.fields.description.stringValue}</p>
          <p>Price: ${product.fields.price.doubleValue}</p>
          <p>Quantity: {product.fields.quantity.integerValue}</p>
          <div className="buttons">
            <button onClick={() => handleDelete(product.id)}>Delete</button>
            <button onClick={() => handleEdit(product.id)}>Edit</button>
          </div>
          {editingProduct === product.id && (
            <div className="edit-form">
              <input
                type="text"
                value={product.fields.name.stringValue}
                onChange={(e) =>
                  handleSaveEdit(product.id, {
                    ...product,
                    fields: {
                      ...product.fields,
                      name: { stringValue: e.target.value },
                    },
                  })
                }
              />
              {/* Add other input fields for editing other properties */}
              <button onClick={() => handleSaveEdit(product.id, product)}>
                Save
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ManageDelete;
