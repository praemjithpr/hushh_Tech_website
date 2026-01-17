/**
 * AgentHeader Component - Minimal Persistent Navigation Header
 * 
 * A clean, minimal header that appears on all agent screens.
 * Features: Home navigation, current view title, user status
 */

import React from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiMessageCircle,
  FiFileText,
  FiActivity,
  FiCpu,
  FiHeart,
} from 'react-icons/fi';

const MotionFlex = motion(Flex);

// Node type to icon mapping
const NODE_ICONS: Record<string, React.ElementType> = {
  chatnode: FiMessageCircle,
  career: FiFileText,
  biological: FiActivity,
  automation: FiCpu,
  dating: FiHeart,
};

// Node type to title mapping
const NODE_TITLES: Record<string, string> = {
  chatnode: 'Chat Node',
  career: 'Resume Node',
  biological: 'Biological Node',
  automation: 'Automation Node',
  dating: 'Intimacy Node',
  all: 'All Agents',
};

interface AgentHeaderProps {
  /** Current active node/filter */
  currentNode: string;
  /** User email for display */
  userEmail?: string;
  /** Callback when home is clicked */
  onHomeClick: () => void;
  /** Callback when sign out is clicked */
  onSignOut: () => void;
  /** Optional coach name when in a session */
  coachName?: string;
}

export const AgentHeader: React.FC<AgentHeaderProps> = ({
  currentNode,
  userEmail,
  onHomeClick,
  onSignOut,
  coachName,
}) => {
  const NodeIcon = NODE_ICONS[currentNode] || FiMessageCircle;
  const nodeTitle = coachName || NODE_TITLES[currentNode] || 'hushh Agents';
  const isHome = currentNode === 'all' && !coachName;

  return (
    <MotionFlex
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      h={{ base: '56px', md: '60px' }}
      px={{ base: 3, sm: 4 }}
      bg="rgba(10, 10, 26, 0.85)"
      backdropFilter="blur(20px)"
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      align="center"
      justify="space-between"
    >
      {/* Left Section - Home + Title */}
      <HStack spacing={{ base: 2, sm: 4 }}>
        {/* Home Button */}
        <Tooltip
          label="Back to Agents"
          placement="bottom"
          hasArrow
          bg="gray.800"
          color="white"
        >
          <IconButton
            aria-label="Home"
            icon={<FiHome />}
            variant="ghost"
            size={{ base: 'sm', md: 'md' }}
            minW={{ base: '44px', md: '40px' }}
            minH={{ base: '44px', md: '40px' }}
            color={isHome ? 'purple.400' : 'gray.400'}
            bg={isHome ? 'whiteAlpha.100' : 'transparent'}
            _hover={{
              color: 'white',
              bg: 'whiteAlpha.100',
              transform: 'scale(1.05)',
            }}
            transition="all 0.2s"
            onClick={onHomeClick}
            borderRadius="xl"
          />
        </Tooltip>

        {/* Divider */}
        <Box h={{ base: '20px', md: '24px' }} w="1px" bg="whiteAlpha.200" display={{ base: 'none', sm: 'block' }} />

        {/* Current View Title */}
        <HStack spacing={{ base: 1.5, sm: 2 }}>
          {!isHome && (
            <Box
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              p={{ base: 1, sm: 1.5 }}
              borderRadius="lg"
              display={{ base: 'none', sm: 'block' }}
            >
              <NodeIcon size={14} color="white" />
            </Box>
          )}
          <VStack align="start" spacing={0}>
            <Text
              color="white"
              fontWeight="600"
              fontSize={{ base: 'xs', sm: 'sm' }}
              letterSpacing="tight"
              noOfLines={1}
            >
              {nodeTitle}
            </Text>
            {!isHome && (
              <Text
                color="gray.500"
                fontSize={{ base: '2xs', sm: 'xs' }}
                fontWeight="medium"
                display={{ base: 'none', sm: 'block' }}
              >
                hushh Sovereign
              </Text>
            )}
          </VStack>
        </HStack>
      </HStack>

      {/* Right Section - User Status */}
      <Menu>
        <MenuButton
          as={Button}
          variant="ghost"
          size={{ base: 'xs', sm: 'sm' }}
          px={{ base: 2, sm: 3 }}
          py={{ base: 1.5, sm: 2 }}
          borderRadius="full"
          bg="whiteAlpha.50"
          _hover={{ bg: 'whiteAlpha.100' }}
          _active={{ bg: 'whiteAlpha.150' }}
          rightIcon={<FiChevronDown size={12} />}
          minH={{ base: '36px', sm: '32px' }}
        >
          <HStack spacing={{ base: 1.5, sm: 2 }}>
            {/* Online Indicator */}
            <Box
              w={{ base: '5px', sm: '6px' }}
              h={{ base: '5px', sm: '6px' }}
              borderRadius="full"
              bg="green.400"
              boxShadow="0 0 8px rgba(72, 187, 120, 0.6)"
            />
            <Text
              color="gray.300"
              fontSize={{ base: '2xs', sm: 'xs' }}
              fontWeight="medium"
              maxW={{ base: '60px', sm: '100px', md: '140px' }}
              isTruncated
            >
              {userEmail || 'Connected'}
            </Text>
          </HStack>
        </MenuButton>

        <MenuList
          bg="gray.900"
          borderColor="whiteAlpha.100"
          py={2}
          minW={{ base: '160px', sm: '180px' }}
        >
          <MenuItem
            icon={<FiUser size={14} />}
            fontSize="sm"
            bg="transparent"
            _hover={{ bg: 'whiteAlpha.100' }}
            color="gray.300"
            isDisabled
          >
            Profile
          </MenuItem>
          <MenuItem
            icon={<FiLogOut size={14} />}
            fontSize="sm"
            bg="transparent"
            _hover={{ bg: 'whiteAlpha.100', color: 'red.400' }}
            color="gray.300"
            onClick={onSignOut}
          >
            Disconnect
          </MenuItem>
        </MenuList>
      </Menu>
    </MotionFlex>
  );
};

export default AgentHeader;
