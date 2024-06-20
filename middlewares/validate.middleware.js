// import UploadService from "../services/upload.service";

export default function validate(validation) {
  return async (req, res, next) => {
    const status = 400;
    const validKeys = ["body", "query", "params"];

    if (!validation || !Object.keys(validation).length) {
      //   UploadService.deleteFiles(req);

      return res.status(status).json({
        success: false,
        message: `${!validation ? "Invalid" : "No"} schema provided.`,
      });
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const key in validation) {
      if (Object.hasOwnProperty.call(validation, key)) {
        try {
          if (!validKeys.includes(key)) {
            // UploadService.deleteFiles(req);

            return res
              .status(status)
              .json({ success: false, message: `Can not perform validation on ${key} in request.` });
          }

          const data = req[key];
          const options = { abortEarly: true };
          const schema = validation[key].required().label(key);
          const value = await schema.validateAsync(data, options);

          req[`${key}Value`] = value;
        } catch (error) {
          //   UploadService.deleteFiles(req);

          if (error.details) {
            const { type, message } = error.details[0];
            return res.status(status).json({ success: false, message: `${message}.`, type });
          }

          return res.status(status).json({ success: false, message: "Invalid schema provided." });
        }
      }
    }

    return next();
  };
}
