var initialState = {
	products: [
		{
			"id": "NJIBQC7Fx",
			"name": "Banana",
			"price": "8",
			"isEditing": false
		},
		{
			"id": "VJu1Qg4Fg",
			"name": "Melon",
			"price": "20",
			"isEditing": false
		},
		{
			"id": "NkwXmlNKe",
			"name": "Guava",
			"price": "18",
			"isEditing": false
		}
	]
};

var tempId = 0;

var Provider = window.ReactRedux.Provider;

var rootState = (state = initialState, action) => {
	switch (action.type) {
		case 'LOAD_PRODUCTS': {
			return Object.assign({}, state, { products: action.products.map((product) => { return Object.assign(product, { isEditing: false }) }) });
		}
		case 'TOGGLE_EDIT': {
			return Object.assign({}, state, { products: state.products.map((product) => {
				if (product.id !== action.id) return product;

				return Object.assign({}, product, { isEditing: product.isEditing ? false : true });
			}) });
		}
		case 'ADD_PRODUCT': {
			return Object.assign({}, state, { products: [
				...state.products,
				action.product
			] });
		}
		case 'UPDATE_PRODUCT': {
			return Object.assign({}, state, { products: state.products.map((product) => {
				if (product.id !== action.id) return product;

				return Object.assign({}, product, action.product, { isEditing: false });
			}) });
		}
		case 'REMOVE_PRODUCT': {
			return Object.assign({}, state, { products: state.products.filter((product) => {
				return product.id !== action.id;
			}) });
		}
		default: return state;
	}
}

var store = window.Redux.createStore(rootState);

var ProductView = ({ id, name, price, isEditing, toggleEdit, update, remove }) => {
	let updatedName;
	let updatedPrice;

	var _updateProduct = () => {
		
		if (!updatedName.value || !updatedPrice.value) {
			updatedName.value = name;
			updatedPrice.value = price;
		}

		update(id, { name: updatedName.value.trim(), price: updatedPrice.value.trim() });
	}

	return (
		<tr>
			<td>{ isEditing ? <input type="text" ref={ (node) => updatedName = node } defaultValue={ name } /> : name }</td>
			<td>{ isEditing ? <input type="text" ref={ (node) => updatedPrice = node } defaultValue={ price } /> : price }</td>
			<td><button type="button" onClick={ !isEditing ? toggleEdit : _updateProduct }>{ isEditing ? 'Save' : 'Edit' }</button></td>
			<td><button type="button" onClick={ isEditing ? toggleEdit : remove }>{ isEditing ? 'Cancel' : 'Delete' }</button></td>
		</tr>
	);
};

var ProductList = ({ products, toggleEdit, update, remove }) => (
	<table className="productList">
		<thead>
			<tr>
				<td>Name</td>
				<td>Price</td>
			</tr>
		</thead>
		<tbody>
			{ products.map((product) => {
				return <ProductView key={ product.id } { ...product } toggleEdit={ () => toggleEdit(product.id) } update={ update } remove={ () => remove(product.id) } />;
			}) }
		</tbody>
	</table>
);

var productListMapStateToProps = (state) => {
	return { products: state.products };
};

var productListMapDispatchToProps = (dispatch) => {
	return {
		toggleEdit (id) { return dispatch({ type: 'TOGGLE_EDIT', id: id }); },
		update (id, product) { return dispatch({  type: 'UPDATE_PRODUCT', id: id, product: product }); },
		remove (id) { return dispatch({ type: 'REMOVE_PRODUCT', id: id }); }
	}
}

var ProductListContainer = window.ReactRedux.connect(productListMapStateToProps, productListMapDispatchToProps)(ProductList);

var ProductAddForm = ({ dispatch }) => {
	let name;
	let price;

	var handleSubmit = (e) => {
		e.preventDefault();
		
		if (!name.value || !price.value) return alert('Values required!');
		dispatch({ type: 'ADD_PRODUCT', product: { id: tempId++, name: name.value.trim(), price: price.value.trim(), isEditing: false } });
		name.value = '';
		price.value = '';
	}

	return (
		<form className="productForm" onSubmit={ handleSubmit }>
			<input type="text" ref={ (node) => name = node } placeholder="Product Name" />
			<input type="text" ref={ (node) => price = node } placeholder="Product Price" />
			<input type="submit" value="Add Product" />
		</form>
	);
};

var ProductAddContainer = window.ReactRedux.connect()(ProductAddForm);

var ProductsBox = ({ dispatch }) => (
	<div className="productBox">
		<h1>Products</h1>
		<ProductListContainer />
		<ProductAddContainer />
	</div>
);

var ProductContainer = window.ReactRedux.connect()(ProductsBox);

ReactDOM.render(
	<Provider store={ store }>
		<ProductContainer />
	</Provider>,
	document.getElementById('content')
);