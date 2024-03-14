# Category Management API

Category management API.

## Installation

1. Clone the repository:

```
git clone https://github.com/evidenze/trust-category-api.git
```

2. Navigate into the project directory:

```
cd trust-category-api
```

3. Install dependencies:

```
npm install
```

4. Copy the `.env.example` file to `.env`:

```
cp .env.example .env
```

5. Configure your database connection in the `.env` file:

```
DB_CONNECTION=postgres
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

## Starting the Server

Start the development server:

```
npm run dev
```

The API will be available at `http://localhost:3000`.

## Running Tests

Run tests to ensure everything is working correctly: 

```
npm run test
```

## API Endpoints

### Create a Category

- **URL:** `/category`
- **Method:** POST
- **Request Body:**
  ```json
  {
      "label": "Category 1",
      "parentId": "",
  }
  ```
- **Response:**
  ```json
  {
    "status": true,
    "message": "Category created successfully",
    "data": {
      "label": "Category 1", "id": 1
    }
  }
  ```

### Remove Category

- **URL:** `/category/:id`
- **Method:** DELETE
- **Response:**
  ```json
  {
      "status": true,
      "message": "Category deleted successfully",
  }
  ```

### Get Subtree

- **URL:** `/category/:parentId/subtree`
- **Method:** GET
- **Response:**
  ```json
  {
      "status": true,
      "message": "Category fetched successfully",
      "data": {
        "id": 14,
        "label": "Category 5",
        "children": [
          {
            "id": 15,
            "label": "Sub Category 6"
          },
          {
            "id": 16,
            "label": "Sub Category 7"
          }
        ]
      }
  }
  ```

### Move Subtree

- **URL:** `/category/:id/move/:newParentId`
  - **Method:** PATCH
  - **Response:**
  ```json
    {
        "status": true,
        "message": "Category moved successfully",
        "data": {
          "id": 15,
          "label": "Category 9",
          "parent": {
            "id": 13,
            "label": "Category 2"
          }
        }
    }
    ```