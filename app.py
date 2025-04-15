from flask import Flask, request, jsonify
from flask_cors import CORS
from config import get_db_connection

app = Flask(__name__)
CORS(app)

@app.route('/addCategory', methods=['POST'])
def add_category():
    data = request.json
    category = data.get('category', '').strip()

    if not category:
        return jsonify({"error": "Category is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM categories WHERE name = %s", (category,))
    if cursor.fetchone():
        return jsonify({"message": "Category already exists"}), 409

    cursor.execute("INSERT INTO categories (name) VALUES (%s)", (category,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Category added successfully"}), 201

@app.route('/addProduct', methods=['POST'])
def add_product():
    data = request.json
    category = data.get('category', '').strip()
    product = data.get('product', '').strip()

    if not category or not product:
        return jsonify({"error": "Both category and product are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM categories WHERE name = %s", (category,))
    category_row = cursor.fetchone()

    if not category_row:
        return jsonify({"error": "Category does not exist"}), 404

    category_id = category_row[0]

    cursor.execute("SELECT * FROM products WHERE name = %s AND category_id = %s", (product, category_id))
    if cursor.fetchone():
        return jsonify({"message": "Product already exists in category"}), 409

    cursor.execute("INSERT INTO products (name, category_id) VALUES (%s, %s)", (product, category_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Product added successfully"}), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)