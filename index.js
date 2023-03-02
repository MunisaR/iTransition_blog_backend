const express = require("express");
const fileupload = require("express-fileupload");
const {
  UserModel,
  CollectionModel,
  CommentModel,
  CategoryModel,
  LikeModel,
} = require("./database/models/database");
const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
app.use(cors("*"));
app.use(bodyParser.json());
app.use(fileupload());
app.use(express.static("files"));

app.post("/login", async (req, res) => {
  const user = await UserModel.find({
    email: req.body.email,
    password: req.body.password,
  });
  if (user[0]?.role === "Admin") {
    res.json({ admin: "admin", user });
  } else {
    res.json({ user: "user", user });
  }
});

app.post("/admin", async (req, res) => {
  if (req.body.role === "Admin") {
    const users = await UserModel.find({});
    res.json({ users: users });
  } else {
    res.status(401).send("not Authorized");
  }
});

app.post("/create_category", async (req, res) => {
  try {
    const category = await CategoryModel.create({ name: req.body.name });
    res.json({ category: category });
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete_user", async (req, res) => {
  const user = await UserModel.findOneAndRemove({ _id: req.body.id });
});

app.post("/delete_collection", async (req, res) => {
  await CollectionModel.findOneAndRemove({ _id: req.body.id });
});

app.post("/delete_category", async (req, res) => {
  const category = await CategoryModel.findOneAndRemove({ _id: req.body.id });
});

app.post("/admin", async (req, res) => {
  if (req.body.role === "Admin") {
    const users = await UserModel.find({});
    res.json({ users: users });
  } else {
    res.status(401).send("not Authorized");
  }
});

app.get("/users", async (req, res) => {
  const users = await UserModel.find({});
  res.json({ users: users });
});

app.get("/", async (req, res) => {
  const users = await UserModel.find({});
  res.json({ users: users });
});
app.post("/", async (req, res) => {
  const users = await UserModel.find({});
  res.json({ users: users, body: req.body });
});
app.get("/admin/collection/:id", async (req, res) => {
  const users = await UserModel.find({ _id: req.params.id });
  res.json({ users: users });
});

app.post("/create_user", async (req, res) => {
  try {
    const newUser = await UserModel.create(req.body.user);
    res.json({ newUser });
  } catch (error) {
    res.json(error);
  }
});

app.post("/create_collection", async (req, res) => {
  const newCollection = await CollectionModel.create(req.body.all);
  res.json({ newCollection });
});

app.get("/collection", async (req, res) => {
  const newCollection = await CollectionModel.find({
    _id: req.params.collection,
  });
  res.json({ newCollection });
});

app.get("/get_collections", async (req, res) => {
  const newCollection = await CollectionModel.find({});
  res.json({ newCollection });
});

app.get("/get_all_users", async (req, res) => {
  const allUsers = await UserModel.find({});
  res.json(allUsers);
});


app.get("/user-profile/:id", async (req, res) => {
  try {
    const userProfile = await UserModel.find({ _id: req.params.id });
    res.json({ userProfile });
  } catch (error) {
    res.send(error);
  }
});

app.post("/get_category/:id", async (req, res) => {
  try {
    const category = await CategoryModel.find({ _id: req.params.id });
    res.json({ category });
  } catch (error) {
    res.send(error);
  }
});

app.post("/get_user", async (req, res) => {
  try {
    const user = await UserModel.find({ _id: req.body.id });
    const { collections } = user[0];
    const arrayOfUserIds = collections.map((e) => {
      return ObjectId(e);
    });
    const col = await CollectionModel.find({
      _id: { $in: arrayOfUserIds },
    });
    res.json({ col });
  } catch (error) {
    res.send(error);
  }
});

app.post("/upload", async (req, res) => {
  try {
    await CollectionModel.findByIdAndUpdate(
      { _id: req.body.id },
      { image: req.body.downloadURL }
    );
    console.log("success");
  } catch (error) {
    console.log("not changed");
  }
});

app.patch("/add-category-to-collection", (req, res) => {
  console.log({ categoryName: req.body.categoryName });
  console.log({ _id: req.body.collectionId });
  try {
        CollectionModel.findOneAndUpdate(
      { _id: req.body.collectionId },
      { categoryName: req.body.categoryName }
    );
  } catch (err) {
    console.log(err);
  }
  console.log({ categoryName: req.body.categoryName });
});

app.patch("/add-collection-to-user", async (req, res) => {
  try {
    UserModel.findOneAndUpdate(
      { _id: req.body.userId },
      { $push: { collections: req.body.collectionId } },
      (e, u) => {
        if (e) return console.log(e);
        console.log(u);
      }
    );
  } catch (err) {
    console.log(err);
  }
});
app.post("/add-category-to-user", async (req, res) => {
  try {
    UserModel.findOneAndUpdate(
      { _id: req.body.UserId },
      { $push: { category: req.body.CategoryId } },
      (e, u) => {
        if (e) return console.log(e);
        console.log(u);
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.patch("/add-collection-to-category", async (req, res) => {
  try {
    console.log(req.body.collectionId, "collectionID");
    console.log(req.body.selectedCollections[0], "selectedCollections");
    CategoryModel.findOneAndUpdate(
      { _id: req.body.collectionId },
      { $push: { collections: req.body.selectedCollections[0] } },
      (e, u) => {
        if (e) return console.log(e);
        console.log(u);
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/get-collections-by-category", async (req, res) => {
  const category = await CategoryModel.find({ _id: req.body.CategoryId });
  const collections = category[0].collections.map((collection) => {
    return ObjectId(collection);
  });
  console.log({ collections });
  try {
    const collectionObjects = await CollectionModel.find({
      _id: { $in: collections },
    }).sort({ name: "asc" });
    res.json({ collectionObjects });
  } catch (error) {
    res.json({ status: "something went wrong" });
  }
});

app.post("/get-category-from-user", async (req, res) => {
  const user = await UserModel.find({ _id: req.body.UserId });
  const cats = user[0].category.map((c) => {
    return ObjectId(c);
  });
  console.log({ cats });
  try {
    const categoryObjects = await CategoryModel.find({
      _id: { $in: cats },
    }).sort({ name: "asc" });
    res.json({ categoryObjects });
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log("something went wrong");
  }
});

app.get("/user-collections/:id", async (req, res) => {
  try {
    const userProfile = await UserModel.find({ _id: req.params.id });
    res.json({ userProfile });
  } catch (error) {
    res.send(error);
  }
});

app.post("/add-like", async (req, res) => {
  try {
    const likesArr = await CollectionModel.find({ _id: req.body.collectionId });
    const like = await LikeModel.create({
      owner: req.body.userId,
      isLiked: true,
    });

    const a = likesArr[0].likes;

    const filtered = a.filter((e) => {
      return e.owner === like.owner;
    });

    if (filtered.length === 0) {
      const collection = await CollectionModel.findOneAndUpdate(
        { _id: req.body.collectionId },
        {
          $push: {
            likes: like,
          },
        }
      );
      res.json(collection.likes);
    } else {
      const filtered = a.filter((e) => {
        return e.owner !== like.owner;
      });
      await CollectionModel.updateOne(
        { _id: req.body.collectionId },
        { $set: { likes: filtered } }
      );
      
    }

    res.json(filtered);
  } catch (e) {
    console.log(e);
  }
});

app.post("/add-comment", async (req, res) => {
  try {
    const comment = await CommentModel.create({
      owner: req.body.userId,
      comment_body: req.body.comment_body,
    });
    const collection = await CollectionModel.findOneAndUpdate(
      { _id: req.body.collectionId },
      {
        $push: {
          comments: comment,
        },
      }
    );
    res.json(collection);
  } catch (error) {
    console.log(error);
  }
});

app.post("/find-tag", async (req, res) => {
  try {
    const collection = await CollectionModel.find({});

    const filtered = collection.filter((item) =>
      item.tags.includes(req.body.tag)
    );

    res.json({ filtered });
  } catch (error) {
    console.log(error);
  }
});

app.post("/get-fav", async (req, res) => {
  try {
    const user = await UserModel.find({ _id: req.body.id });
    res.json({ user });
  } catch (error) {
    res.send(error);
  }
});

app.patch("/remove-from-fav", async (req, res) => {
  await UserModel.updateMany(
    { _id: req.body.id },
    {
      $pull: { favourite: { title: req.body.collectionTitle } },
    }
  );
});
app.post("/add-to-fav", async (req, res) => {
  try {
    UserModel.findOneAndUpdate(
      { _id: req.body.id },
      { $push: { favourite: req.body.collectionId } },
      (e, u) => {
        if (e) return console.log(e);
        console.log(u);
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/get-collection-by-id", async (req, res) => {
  try {
    const collection = await CollectionModel.find({ _id: req.body.collectionId });
    res.json(collection);
  } catch (err) {
    console.log(err);
    res.json(err)
  }
});

app.listen(8888, (err) => {
  console.log("server listening on port 8888");
});
