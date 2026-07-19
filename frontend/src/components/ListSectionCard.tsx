import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme';

export function ListSectionCard({
  children,
  dividerInset = 56,
}: {
  children: ReactNode;
  /** Left inset for the row separator, matching "16px + icon width + gutter". */
  dividerInset?: number;
}) {
  const { colors, radii } = useAppTheme();
  const items = Children.toArray(children).filter(Boolean);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.lg },
      ]}
    >
      {items.map((child, index) => (
        <Fragment key={isValidElement(child) && child.key ? child.key : index}>
          {child}
          {index < items.length - 1 && (
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                marginLeft: dividerInset,
                backgroundColor: colors.outlineVariant,
                opacity: 0.5,
              }}
            />
          )}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
});
