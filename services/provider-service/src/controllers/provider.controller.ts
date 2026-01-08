import { validate } from "../core/http/validate";
import { ProviderService } from "../services/provider.service";
import { catchError } from "../utils/catch-error";
import {
  CreateProviderSchema,
  ListProvidersQuerySchema,
  ProviderIdParamSchema,
  UpdateProviderSchema,
} from "../validators/provider.schema";

class ProviderController {
  private providerService = new ProviderService();

  create = catchError(async (req, res) => {
    const payload = validate(CreateProviderSchema, req.body);
    const provider = await this.providerService.create(payload);

    res.status(201).json(provider);
  });

  getOne = catchError(async (req, res) => {
    const { id } = validate(ProviderIdParamSchema, req.params);
    const provider = await this.providerService.findById(id);

    res.status(200).json(provider);
  });

  update = catchError(async (req, res) => {
    const { id } = validate(ProviderIdParamSchema, req.params);
    const payload = validate(UpdateProviderSchema, req.body);

    const provider = await this.providerService.update(id, payload);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json(provider);
  });

  disable = catchError(async (req, res) => {
    const { id } = validate(ProviderIdParamSchema, req.params);

    const provider = await this.providerService.disable(id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json(provider);
  });

  activate = catchError(async (req, res) => {
    const { id } = validate(ProviderIdParamSchema, req.params);

    const provider = await this.providerService.activate(id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    res.json(provider);
  });

  list = catchError(async (req, res) => {
    // const query = validate(ListProvidersQuerySchema, req.query);
    const query = validate(ListProvidersQuerySchema, req.query);
    const result = await this.providerService.list(query);
    res.json(result);
  });

  stats = catchError(async (req, res) => {
    const stats = await this.providerService.stats();
    res.json(stats);
  });
}

export const providerController = new ProviderController();
