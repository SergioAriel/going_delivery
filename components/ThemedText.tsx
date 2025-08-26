import { Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

const variants = {
  default: 'text-base dark:text-white',
  title: 'text-2xl font-bold dark:text-white',
  defaultSemiBold: 'text-base font-semibold dark:text-white',
  subtitle: 'text-xl font-bold dark:text-white',
  link: 'text-base text-blue-500',
};

export function ThemedText({
  type = 'default',
  className,
  ...rest
}: ThemedTextProps) {
  return <Text className={`${variants[type]} ${className}`} {...rest} />;
}
