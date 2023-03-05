# Kishi-NodeJS

Kishi-NodeJS is a backend server template and framework based on MySQL Databases.

## models

models define relational Database structure and attributes, based on Sequelize
integrates multiple database features patterns:

- Eager Loading
- associated Create/Update
- Class inheritance
- Interface Implementation
- transaction+error handling

We can also define routing and services options for our tables.

## routes

Routes exposes the server to REST API request based on models.
supported features:

- view in multiple predefined schema
- search with deep associations + pagination
- File Upload
- CRUD persmissions based on authenticated User (WIP)

## services

Most Services are implemented in a way that centers around database action and columns
others simplify external libraries and clients for better integration
examples:

### awsS3 

Provides File storage support that are integrated in DataTypes, we can use S3File DataType instead of saving files in the server

### elasticsearch 

Provides interfaces for models to index rows

### notifications 

Provides interfaces to create notifications based on Create/Update actions

### queryCache 

Passive optimizer that saves database queries and returns them when no relevant change have been commited

### TO FIX 

attribute binders with transaction
