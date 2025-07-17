import { Router } from "express";
import { createResource, getAllResources } from "../controllers/resourceController";

const router = Router();

router.post("/", createResource);
router.get("/", getAllResources);


export default router;