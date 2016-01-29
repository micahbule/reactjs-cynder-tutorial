var ProductEditForm = React.createClass({
	getInitialState: function () {
		return { id: this.props.data.id, name: this.props.data.name, price: this.props.data.price };
	},
	handleSubmit: function () {
		var product = this.state;

		$.ajax({
			url: '/api/products/' + product.id,
			method: 'PUT',
			dataType: 'json',
			data: product
		}).then(function(data) {
			this.props.onItemsUpdated(data);
		}.bind(this), function (xhr, status, err) {
			console.log(status, err.toString());
		}.bind(this));
	},
	handleNameChange: function (e) {
		this.setState({ name: e.target.value });
	},
	handlePriceChange: function (e) {
		this.setState({ price: e.target.value });
	},
	render: function () {
		return (
			<tr>
				<td><input type="text" value={ this.state.name } onChange={ this.handleNameChange } /></td>
				<td><input type="text" value={ this.state.price } onChange={ this.handlePriceChange } /></td>
				<td><button type="button" onClick={ this.handleSubmit }>Save</button></td>
				<td><button type="button" onClick={ this.props.onProductEditCancel }>Cancel</button></td>
			</tr>
		);
	}
});

var ProductListForm = React.createClass({
	render: function () {
		return (
			<tr>
				<td>{ this.props.data.name }</td>
				<td>{ this.props.data.price }</td>
				<td><button type="button" onClick={ this.props.onProductEdit }>Edit</button></td>
				<td><button type="button" onClick={ this.props.onProductDelete }>Delete</button></td>
			</tr>
		);
	}
});

var Product = React.createClass({
	getInitialState: function () {
		return { isEditing: false };
	},
	handleProductDelete: function () {
		this.props.onProductDelete(this.props.data);
	},
	handleProductEdit: function () {
		this.setState({ isEditing: true });
	},
	handleProductEditCancel: function () {
		this.setState({ isEditing: false });
	},
	handleItemsUpdated: function (products) {
		this.props.onItemsUpdated(products);
		this.handleProductEditCancel();
	},
	renderEditForm: function () {
		return (
			<ProductEditForm
				data={ this.props.data }
				onProductEditCancel={ this.handleProductEditCancel }
				onItemsUpdated={ this.handleItemsUpdated } />
		);
	},
	renderList: function () {
		return (
			<ProductListForm
				data={ this.props.data }
				onProductEdit={ this.handleProductEdit }
				onProductDelete={ this.handleProductDelete } />
		);
	},
	render: function () {
		return this.state.isEditing ? this.renderEditForm() : this.renderList();
	}
});

var ProductList = React.createClass({
	render: function () {
		var productNodes = this.props.data.map(function (product) {
			return (
				<Product data={ product } key={ product.id } onProductDelete={ this.props.onProductDelete } onItemsUpdated={ this.props.onItemsUpdated } />
			);
		}.bind(this));

		return (
			<table className="productList">
				<thead>
					<tr>
						<td>Name</td>
						<td>Price</td>
					</tr>
				</thead>
				<tbody>
					{ productNodes }
				</tbody>
			</table>
		);
	}
});

var ProductForm = React.createClass({
	getInitialState: function () {
		return { name: '', price: '', id: '', submitValue: 'Add' };
	},
	handleSubmit: function (e) {
		e.preventDefault();
		var product = {
			name: this.state.name.trim(),
			price: this.state.price.trim()
		};

		if (!this.state.name || !this.state.price) return;
		if (this.state.id.trim()) product.id = this.state.id.trim();

		this.props.onProductSubmit(product);
		this.setState({ name: '', price: '' });
	},
	handleNameChange: function (e) {
		this.setState({ name: e.target.value });
	},
	handlePriceChange: function (e) {
		this.setState({ price: e.target.value });
	},
	render: function () {
		return (
			<form className="productForm" onSubmit={ this.handleSubmit }>
				<input type="text" placeholder="Product Name" value={ this.state.name } onChange={ this.handleNameChange } />
				<input type="text" placeholder="Product Price" value={ this.state.price } onChange={ this.handlePriceChange } />
				<input type="submit" value={ this.state.submitValue } />
			</form>
		)
	}
});

var ProductBox = React.createClass({
	getInitialState: function () {
		return { data: [] };
	},
	componentDidMount: function () {
		this.loadCommentsFromServer();
		setInterval(this.loadCommentsFromServer, this.props.pollInterval);
	},
	loadCommentsFromServer: function () {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false
		}).then(function (data) {
			this.setState({ data: data })
		}.bind(this), function (xhr, status, err) {
			console.log(this.props.url, status, err.toString());
		}.bind(this));
	},
	handleProductSubmit: function (product) {
		var products = this.state.data;

		if(!product.id) product.id = Date.now();
		var newProducts = products.concat([product]);
		this.setState({ data: newProducts });

		$.ajax({
			url: this.props.url,
			method: 'POST',
			dataType: 'json',
			data: product
		}).then(function (data) {
			this.setState({ data: data });
		}.bind(this), function (xhr, status, err) {
			console.log(this.props.url, status, err.toString());
		}.bind(this));
	},
	handleProductDelete: function (product) {
		var products = this.state.data;
		var newProducts = products.filter(function (element) { return element.id != product.id });
		this.setState({ data: newProducts });

		$.ajax({
			url: this.props.url + '/' + product.id,
			method: 'DELETE'
		}).then(function (data) {
			this.setState({ data: data });
		}.bind(this), function (xhr, status, err) {
			console.log(this.props.url, status, err.toString());
		}.bind(this));
	},
	handleItemsUpdated: function (products) {
		this.setState({ data: products });
	},
	render: function () {
		return (
			<div className="productBox">
				<h1>Products</h1>
				<ProductList data={ this.state.data } onProductDelete={ this.handleProductDelete } onItemsUpdated={ this.handleItemsUpdated } />
				<ProductForm onProductSubmit={ this.handleProductSubmit } />
			</div>
		);
	}
});

ReactDOM.render(
	<ProductBox url="/api/products" pollInterval={ 2000 } />,
	document.getElementById('content')
);