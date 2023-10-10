import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPage.css';

function AddProduct() {
  const [product, setProduct] = useState({
    category: 'Computer',
    description: '',
    modelNo: '',
    price: '',
    productname: '',
    shopid: 'shop16', // Pre-defined shopid
    stock: '',
  });

  const [Products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [showAddProductForm, setShowAddProductForm] = useState(false); // Control the visibility of the "Add Product" form

  const apiUrl =
    'https://firestore.googleapis.com/v1/projects/d-richie-computers/databases/(default)/documents/Products';

  const [searchInput, setSearchInput] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const firebaseStorageUrl =
    'https://firebasestorage.googleapis.com/v0/b/d-richie-computers.appspot.com';

  useEffect(() => {
    axios
      .get(apiUrl)
      .then((response) => {
        const productList = response.data.documents.map((doc) => ({
          id: doc.name.split('/').pop(),
          fields: doc.fields,
        }));
        setProducts(productList);
        setFilteredProducts(productList);
      })
      .catch((error) => {
        console.error('Error fetching products: ', error);
      });
  }, []);

  useEffect(() => {
    const searchTerm = searchInput.toLowerCase();
    const filtered = Products.filter((product) =>
      product.fields.productname.stringValue.toLowerCase().includes(searchTerm)
    );
    setFilteredProducts(filtered);
  }, [searchInput, Products]);

  const handleSearch = () => {
    const searchTerm = searchInput.toLowerCase();
    const filtered = Products.filter((product) =>
      product.fields.productname.stringValue.toLowerCase().includes(searchTerm)
    );
    setFilteredProducts(filtered);
  };

  const handleAddProduct = async () => {
    const imageFile = product.imageurl;
    const imageName = imageFile.name;
    const imageRef =
      firebaseStorageUrl + '/' + encodeURIComponent(imageName) + '?alt=computer';

    const payload = {
      fields: {
        category: { stringValue: product.category },
        description: { stringValue: product.description },
        modelNo: { stringValue: product.modelNo },
        price: { IntegerValue: parseFloat(product.price) },
        productname: { stringValue: product.productname },
        shopid: { stringValue: product.shopid },
        stock: { integerValue: parseInt(product.stock, 10) },
        imageurl: { stringValue: imageRef },
      },
    };

    try {
      // Upload the image to Firebase Storage
      const imageUploadResponse = await axios.post(imageRef, imageFile, {
        headers: {
          'Content-Type': imageFile.type,
        },
      });

      if (imageUploadResponse.status === 200) {
        // Image uploaded successfully, now add the product
        const productAddResponse = await axios.post(apiUrl, payload);
        if (productAddResponse.status === 200) {
          const newProduct = {
            id: productAddResponse.data.name.split('/').pop(),
            fields: payload.fields,
          };
          const updatedProducts = [...Products, newProduct];
          setProducts(updatedProducts);
          setFilteredProducts(updatedProducts);
          setProduct({
            category: 'Computer',
            description: '',
            modelNo: '',
            price: '',
            productname: '',
            shopid: 'shop16',
            stock: '',
            imageurl: '',
          });
          setShowAddProductForm(false); // Close the form after adding a product
        } else {
          console.log('Error: Product addition failed');
        }
      } else {
        console.log('Error: Image upload failed');
      }
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this product?'
    );
    if (confirmDelete) {
      try {
        const response = await axios.delete(`${apiUrl}/${id}`);
        if (response.status === 200) {
          const updatedProducts = Products.filter((product) => product.id !== id);
          setProducts(updatedProducts);
          setFilteredProducts(updatedProducts);
        } else {
          console.log('Error: Product deletion failed');
        }
      } catch (error) {
        console.error('Error: ', error);
      }
    }
  };

  const handleEditProduct = (id) => {
    const editedProduct = Products.find((product) => product.id === id);
    setProduct({
      category: 'computer',
      description: editedProduct.fields.description.stringValue,
      modelNo: editedProduct.fields.modelNo.stringValue,
      price: editedProduct.fields.price.IntegerValue,
      productname: editedProduct.fields.productname.stringValue,
      shopid: 'shop16', // Pre-defined shopid
      stock: editedProduct.fields.stock.integerValue,
      imageurl: editedProduct.fields.imageurl.stringValue,
    });
    setEditProductId(id);
    setIsEditing(true);
    setShowAddProductForm(true); // Show the "Add Product" form when editing
  };

  const handleSaveEdit = async () => {
    const imageFile = product.imageurl;
    const imageName = imageFile.name;
    const imageRef =
      firebaseStorageUrl + '/' + encodeURIComponent(imageName) + '?alt=computer';

    const payload = {
      fields: {
        category: { stringValue: 'computer' },
        description: { stringValue: product.description },
        modelNo: { stringValue: product.modelNo },
        price: { IntegerValue: parseFloat(product.price) },
        productname: { stringValue: product.productname },
        shopid: { stringValue: 'Shop16' }, // Pre-defined shopid
        stock: { integerValue: parseInt(product.stock, 10) },
        imageurl: { stringValue: imageRef },
      },
    };

    try {
      // Upload the new image to Firebase Storage
      const imageUploadResponse = await axios.post(imageRef, imageFile, {
        headers: {
          'Content-Type': imageFile.type,
        },
      });

      if (imageUploadResponse.status === 200) {
        // Image uploaded successfully, now update the product
        const productUpdateResponse = await axios.patch(
          `${apiUrl}/${editProductId}`,
          payload
        );
        if (productUpdateResponse.status === 200) {
          const updatedProducts = Products.map((p) =>
            p.id === editProductId ? { ...p, fields: payload.fields } : p
          );
          setProducts(updatedProducts);
          setFilteredProducts(updatedProducts);
          setIsEditing(false);
          setEditProductId(null);
          setProduct({
            category: 'Computer',
            description: '',
            modelNo: '',
            price: '',
            productname: '',
            shopid: 'shop16',
            stock: '',
            imageurl: '',
          });
          setShowAddProductForm(false); // Close the form after saving edit
        } else {
          console.log('Error: Product editing failed');
        }
      } else {
        console.log('Error: Image upload failed');
      }
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditProductId(null);
    setProduct({
      category: 'computer',
      description: '',
      modelNo: '',
      price: '',
      productname: '',
      shopid: 'shop16',
      stock: '',
      imageurl: '',
    });
    setShowAddProductForm(false); // Close the form when canceling edit
  };

  return (
    <div className="add-product-pages">
      <div className="add-product-containers">
        <h1>{isEditing ? 'Edit Product' : 'Add Product'}</h1>
        {/* Button to toggle the "Add Product" form */}
        <button onClick={() => setShowAddProductForm(!showAddProductForm)}>
          {showAddProductForm ? 'Close Form' : 'Add Product'}
        </button>

        {/* "Add Product" form */}
        {showAddProductForm && (
  <div className="product-forms">
    <div>
      <label>Category</label>
      <input
        type="text"
        value={product.category}
        disabled
      />
    </div>
    <div className="form-group">
      <div className="description-input">
        <label>Description:</label>
        <input
          type="text"
          value={product.description}
          onChange={(e) =>
            setProduct({ ...product, description: e.target.value })
          }
        />
      </div>
      <div>
        <label>Model No:</label>
        <input
          type="text"
          value={product.modelNo}
          onChange={(e) =>
            setProduct({ ...product, modelNo: e.target.value })
          }
        />
      </div>
      <div>
        <label>Price:</label>
        <input
          type="number"
          value={product.price}
          onChange={(e) =>
            setProduct({ ...product, price: e.target.value })
          }
        />
      </div>
      <div>
        <label>Product Name:</label>
        <input
          type="text"
          value={product.productname}
          onChange={(e) =>
            setProduct({ ...product, productname: e.target.value })
          }
        />
      </div>
      <div>
        <label>Shop Name:</label>
        <input
          type="text"
          value={product.shopid}
          disabled
        />
      </div>
      <div>
        <label>Stock:</label>
        <input
          type="number"
          value={product.stock}
          onChange={(e) =>
            setProduct({ ...product, stock: e.target.value })
          }
        />
      </div>
    </div>
    <div>
      <label>Image File:</label>
      <input
        type="file"
        onChange={(e) =>
          setProduct({ ...product, imageurl: e.target.files[0] })
        }
      />
    </div>
    {isEditing ? (
      <div>
        <button onClick={handleSaveEdit}>Save Edit</button>
        <button onClick={handleCancelEdit}>Cancel Edit</button>
      </div>
    ) : (
      <button onClick={handleAddProduct}>Add Product</button>
    )}
  </div>
)}
      </div>
      <div className="product-lists">
        <h1 className="ProductListName">Product List</h1>
        <div className="product-searches">
          <input
            type="text"
            placeholder="Search by product name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <ul>
  {filteredProducts.map((product) => (
    <div className="product-items" key={product.id}>
      <div className="product-cards">
        <div className="product-images">
          <img
            src={product.fields.imageurl?.stringValue}
            alt={product.fields.productname?.stringValue}
          />
        </div>
        
        <div className="product-details-1">
          <strong>{product.fields.productname?.stringValue}</strong>
          <p><strong>Description:</strong></p>
          <p>{product.fields.description?.stringValue}</p>
        </div>
        <div className="product-details-2">
          <p><strong>Price:</strong> ${product.fields.price?.integerValue}</p>
          <p><strong>Stock:</strong> {product.fields.stock?.integerValue}</p>
          <div className="product-buttons-2">
            <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
            <button onClick={() => handleEditProduct(product.id)}>Edit</button>
          </div>
        </div>
      </div>
    </div>
  ))}
</ul>
      </div>
    </div>
  );
}

export default AddProduct;
