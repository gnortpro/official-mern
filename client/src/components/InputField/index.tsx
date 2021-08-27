import {
  FormLabel,
  Input,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useField } from "formik";
import React from "react";

interface IProps {
  name: string;
  label: string;
  placeholder: string;
  type: string;
}

const InputField: React.FC<IProps> = ({ label, ...props }) => {
  const [field, { error }] = useField(props);

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Input id={field.name} {...props} {...field} />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default InputField;
