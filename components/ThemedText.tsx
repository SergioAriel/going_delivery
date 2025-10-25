import { Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

const typeClasses = {
    default: 'text-base leading-6 text-gray-900 dark:text-white',
    defaultSemiBold: 'text-base leading-6 font-semibold text-gray-900 dark:text-white',
    title: 'text-4xl font-bold leading-10 text-gray-900 dark:text-white',
    subtitle: 'text-xl font-bold text-gray-900 dark:text-white',
    link: 'text-base leading-loose text-blue-600',
  };

export function ThemedText({
  type = 'default',
  className,
  ...rest
}: ThemedTextProps) {
  return <Text className={`${typeClasses[type]} ${className || ''}`} {...rest} />;
}
