import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import UserPage from './components/UserPage';
import AddProduct from './components/AdminPage';

function App() {
  const pathname = window.location.pathname;

  if (pathname === '/') {
    return <UserPage />;
  } else if (pathname === '/admin') {
    return <AddProduct />;
  }
  return (
    <BrowserRouter>
    <Routes>
      <Route exact path="/" element={UserPage} />
      <Route path="/admin" element={AddProduct} />
      <Route>
        <div>
          <h1>Page Not Found</h1>
        </div>
      </Route>
    </Routes>
  </BrowserRouter>
  );
}

export default App;
